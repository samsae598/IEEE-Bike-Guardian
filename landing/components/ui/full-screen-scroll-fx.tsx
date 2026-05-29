'use client';

import React, {
  CSSProperties,
  ReactNode,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type Section = {
  id?: string;
  background: string;
  leftLabel?: ReactNode;
  title: string | ReactNode;
  rightLabel?: ReactNode;
  body?: ReactNode;
  details?: ReactNode;
  renderBackground?: (active: boolean, previous: boolean) => ReactNode;
};

type Colors = Partial<{
  text: string;
  overlay: string;
  pageBg: string;
  stageBg: string;
}>;

type Durations = Partial<{
  change: number;
  snap: number;
}>;

export type FullScreenFXAPI = {
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  getIndex: () => number;
  refresh: () => void;
};

export type FullScreenFXProps = {
  sections: Section[];
  className?: string;
  style?: CSSProperties;
  fontFamily?: string;
  header?: ReactNode;
  footer?: ReactNode;
  gap?: number;
  gridPaddingX?: number;
  showProgress?: boolean;
  debug?: boolean;
  durations?: Durations;
  reduceMotion?: boolean;
  smoothScroll?: boolean;
  bgTransition?: 'fade' | 'wipe';
  parallaxAmount?: number;
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
  initialIndex?: number;
  colors?: Colors;
  apiRef?: React.Ref<FullScreenFXAPI>;
  ariaLabel?: string;
};

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export const FullScreenScrollFX = forwardRef<HTMLDivElement, FullScreenFXProps>(
  (
    {
      sections,
      className,
      style,
      fontFamily = '"Space Grotesk", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
      header,
      footer,
      gap = 1,
      gridPaddingX = 2,
      showProgress = true,
      debug = false,
      durations = { change: 0.7, snap: 800 },
      reduceMotion,
      smoothScroll = false,
      bgTransition = 'fade',
      parallaxAmount = 4,
      currentIndex,
      onIndexChange,
      initialIndex = 0,
      colors = {
        text: 'rgba(245,245,245,0.92)',
        overlay: 'rgba(0,0,0,0.35)',
        pageBg: '#ffffff',
        stageBg: '#000000',
      },
      apiRef,
      ariaLabel = 'Full screen scroll slideshow',
    },
    ref
  ) => {
    const total = sections.length;
    const [localIndex, setLocalIndex] = useState(clamp(initialIndex, 0, Math.max(0, total - 1)));
    const isControlled = typeof currentIndex === 'number';
    const index = isControlled ? clamp(currentIndex!, 0, Math.max(0, total - 1)) : localIndex;

    const rootRef = useRef<HTMLDivElement | null>(null);
    const fixedRef = useRef<HTMLDivElement | null>(null);
    const fixedSectionRef = useRef<HTMLDivElement | null>(null);

    const bgRefs = useRef<HTMLImageElement[]>([]);

    const leftTrackRef = useRef<HTMLDivElement | null>(null);
    const rightTrackRef = useRef<HTMLDivElement | null>(null);
    const leftItemRefs = useRef<HTMLDivElement[]>([]);
    const rightItemRefs = useRef<HTMLDivElement[]>([]);

    const progressFillRef = useRef<HTMLDivElement | null>(null);
    const currentNumberRef = useRef<HTMLSpanElement | null>(null);
    const headerRef = useRef<HTMLDivElement | null>(null);
    const footerTitleRef = useRef<HTMLDivElement | null>(null);
    const detailRefs = useRef<(HTMLDivElement | null)[]>([]);
    const bodyRefs = useRef<(HTMLDivElement | null)[]>([]);
    const hasBody = sections.some((s) => s.body);

    const stRef = useRef<ScrollTrigger | null>(null);
    const lastIndexRef = useRef(index);
    const targetIndexRef = useRef(index); // where we're heading (may differ from lastIndex mid-animation)
    const isAnimatingRef = useRef(false);
    const isSnappingRef = useRef(false);
    const sectionTopRef = useRef<number[]>([]);
    const pendingIndexRef = useRef<number | null>(null);

    const prefersReduced = useMemo(() => {
      if (typeof window === 'undefined') return false;
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }, []);
    const motionOff = reduceMotion ?? prefersReduced;

    const titleRefs = useRef<(HTMLDivElement | null)[]>([]);

    const computePositions = () => {
      const el = fixedSectionRef.current;
      if (!el) return;
      const top = el.offsetTop;
      const h = el.offsetHeight;
      const arr: number[] = [];
      for (let i = 0; i < total; i++) arr.push(top + (h * i) / total);
      sectionTopRef.current = arr;
    };

    const measureRAF = (fn: () => void) => {
      if (typeof window === 'undefined') return;
      requestAnimationFrame(() => requestAnimationFrame(fn));
    };

    const measureAndCenterLists = (toIndex = index, animate = true) => {
      const centerTrack = (
        container: HTMLDivElement | null,
        items: HTMLDivElement[],
        isRight: boolean
      ) => {
        if (!container || items.length === 0) return;
        const first = items[0];
        const second = items[1];
        const contRect = container.getBoundingClientRect();
        let rowH = first.getBoundingClientRect().height;
        if (second) {
          rowH = second.getBoundingClientRect().top - first.getBoundingClientRect().top;
        }
        const targetY = contRect.height / 2 - rowH / 2 - toIndex * rowH;
        const prop = isRight ? rightTrackRef : leftTrackRef;
        if (!prop.current) return;
        if (animate) {
          gsap.to(prop.current, {
            y: targetY,
            duration: (durations.change ?? 0.7) * 0.9,
            ease: 'power3.out',
          });
        } else {
          gsap.set(prop.current, { y: targetY });
        }
      };

      measureRAF(() => {
        measureRAF(() => {
          centerTrack(leftTrackRef.current, leftItemRefs.current, false);
          centerTrack(rightTrackRef.current, rightItemRefs.current, true);
        });
      });
    };

    useLayoutEffect(() => {
      if (typeof window === 'undefined') return;
      const fixed = fixedRef.current;
      const fs = fixedSectionRef.current;
      if (!fixed || !fs || total === 0) return;

      gsap.set(bgRefs.current, { opacity: 0, scale: 1.04, yPercent: 0 });
      if (bgRefs.current[0]) gsap.set(bgRefs.current[0], { opacity: 1, scale: 1 });

      // Simple title fade — no word splitting
      titleRefs.current.forEach((el, i) => {
        if (el) gsap.set(el, { opacity: i === index ? 1 : 0, y: i === index ? 0 : 20 });
      });

      computePositions();
      measureAndCenterLists(index, false);

      // Header + footer title only visible on slide 0
      if (initialIndex !== 0) {
        if (headerRef.current) gsap.set(headerRef.current, { opacity: 0, y: -16 });
        if (footerTitleRef.current) gsap.set(footerTitleRef.current, { opacity: 0, y: 16 });
      }

      // Set initial detail states
      detailRefs.current.forEach((el, i) => {
        if (el) gsap.set(el, { opacity: i === index ? 1 : 0, y: i === index ? 0 : 14 });
      });

      // Set initial body states
      bodyRefs.current.forEach((el, i) => {
        if (el) gsap.set(el, { opacity: i === index ? 1 : 0, x: i === index ? 0 : 30 });
      });

      const st = ScrollTrigger.create({
        trigger: fs,
        start: 'top top',
        end: 'bottom bottom',
        pin: fixed,
        pinSpacing: true,
        onUpdate: (self) => {
          // Drive progress bar from raw scroll position — always smooth
          if (progressFillRef.current) {
            progressFillRef.current.style.width = `${self.progress * 100}%`;
          }

          if (motionOff || isSnappingRef.current) return;
          const prog = self.progress;
          const target = Math.min(total - 1, Math.floor(prog * total));
          // compare against targetIndexRef so mid-animation scroll reversals are caught
          if (target !== targetIndexRef.current) {
            if (!isAnimatingRef.current) {
              goTo(target, false);
            } else {
              pendingIndexRef.current = target;
            }
          }
        },
      });

      stRef.current = st;

      if (initialIndex && initialIndex > 0 && initialIndex < total) {
        requestAnimationFrame(() => goTo(initialIndex, false));
      }

      const ro = new ResizeObserver(() => {
        computePositions();
        measureAndCenterLists(lastIndexRef.current, false);
        ScrollTrigger.refresh();
      });
      ro.observe(fs);

      return () => {
        ro.disconnect();
        st.kill();
        stRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [total, initialIndex, motionOff, bgTransition, parallaxAmount]);

    const changeSection = (to: number) => {
      if (isAnimatingRef.current || to === lastIndexRef.current) return;
      targetIndexRef.current = to; // mark destination immediately
      const from = lastIndexRef.current;
      const down = to > from;
      isAnimatingRef.current = true;

      if (!isControlled) setLocalIndex(to);
      onIndexChange?.(to);

      if (currentNumberRef.current) {
        currentNumberRef.current.textContent = String(to + 1).padStart(2, '0');
      }

      const D = durations.change ?? 0.7;

      // Header + footer title fade with slide 0
      if (from === 0) {
        if (headerRef.current) gsap.to(headerRef.current, { opacity: 0, y: -16, duration: D * 0.55, ease: 'power3.out' });
        if (footerTitleRef.current) gsap.to(footerTitleRef.current, { opacity: 0, y: 16, duration: D * 0.55, ease: 'power3.out' });
      } else if (to === 0) {
        if (headerRef.current) gsap.to(headerRef.current, { opacity: 1, y: 0, duration: D, ease: 'power3.out' });
        if (footerTitleRef.current) gsap.to(footerTitleRef.current, { opacity: 1, y: 0, duration: D, ease: 'power3.out' });
      }

      // Title fade in/out
      const outTitle = titleRefs.current[from];
      const inTitle = titleRefs.current[to];
      if (outTitle) gsap.to(outTitle, { opacity: 0, y: down ? -20 : 20, duration: D * 0.35, ease: 'power2.out' });
      if (inTitle) {
        gsap.set(inTitle, { opacity: 0, y: down ? 30 : -30 });
        gsap.to(inTitle, { opacity: 1, y: 0, duration: D * 0.85, ease: 'power3.out', delay: D * 0.1 });
      }

      // Animate right-side body panels in/out
      const prevBody = bodyRefs.current[from];
      const newBody = bodyRefs.current[to];
      if (prevBody) gsap.to(prevBody, { opacity: 0, x: down ? -20 : 20, duration: D * 0.35, ease: 'power2.out' });
      if (newBody) {
        gsap.set(newBody, { opacity: 0, x: down ? 30 : -30 });
        gsap.to(newBody, { opacity: 1, x: 0, duration: D * 0.85, ease: 'power3.out', delay: D * 0.2 });
      }

      // Fade detail cards in/out
      const prevDetail = detailRefs.current[from];
      const newDetail = detailRefs.current[to];
      if (prevDetail) gsap.to(prevDetail, { opacity: 0, y: -10, duration: D * 0.4, ease: 'power2.out' });
      if (newDetail) {
        gsap.set(newDetail, { opacity: 0, y: 14 });
        gsap.to(newDetail, { opacity: 1, y: 0, duration: D * 0.8, ease: 'power3.out', delay: D * 0.25 });
      }

      const prevBg = bgRefs.current[from];
      const newBg = bgRefs.current[to];
      if (bgTransition === 'fade') {
        if (newBg) {
          gsap.set(newBg, { opacity: 0, scale: 1.04, yPercent: down ? 1 : -1 });
          gsap.to(newBg, { opacity: 1, scale: 1, yPercent: 0, duration: D, ease: 'power2.out' });
        }
        if (prevBg) {
          gsap.to(prevBg, {
            opacity: 0,
            yPercent: down ? -parallaxAmount : parallaxAmount,
            duration: D,
            ease: 'power2.out',
          });
        }
      } else {
        if (newBg) {
          gsap.set(newBg, {
            opacity: 1,
            clipPath: down ? 'inset(100% 0 0 0)' : 'inset(0 0 100% 0)',
            scale: 1,
            yPercent: 0,
          });
          gsap.to(newBg, { clipPath: 'inset(0 0 0 0)', duration: D, ease: 'power3.out' });
        }
        if (prevBg) {
          gsap.to(prevBg, { opacity: 0, duration: D * 0.8, ease: 'power2.out' });
        }
      }

      measureAndCenterLists(to, true);

      leftItemRefs.current.forEach((el, i) => {
        el.classList.toggle('active', i === to);
        gsap.to(el, {
          opacity: i === to ? 1 : 0.35,
          x: i === to ? 10 : 0,
          duration: D * 0.6,
          ease: 'power3.out',
        });
      });
      rightItemRefs.current.forEach((el, i) => {
        el.classList.toggle('active', i === to);
        gsap.to(el, {
          opacity: i === to ? 1 : 0.35,
          x: i === to ? -10 : 0,
          duration: D * 0.6,
          ease: 'power3.out',
        });
      });

      gsap.delayedCall(D, () => {
        lastIndexRef.current = to;
        isAnimatingRef.current = false;
        const pending = pendingIndexRef.current;
        pendingIndexRef.current = null;
        if (pending !== null && pending !== to) {
          goTo(pending, false);
        }
      });
    };

    const goTo = (to: number, withScroll = true) => {
      const clamped = clamp(to, 0, total - 1);
      changeSection(clamped);

      if (withScroll && typeof window !== 'undefined') {
        isSnappingRef.current = true;
        const pos = sectionTopRef.current[clamped];
        const snapMs = durations.snap ?? 800;
        window.scrollTo({ top: pos, behavior: 'smooth' });
        setTimeout(() => (isSnappingRef.current = false), snapMs);
      }
    };

    const next = () => goTo(index + 1);
    const prev = () => goTo(index - 1);

    useImperativeHandle(apiRef, () => ({
      next,
      prev,
      goTo,
      getIndex: () => index,
      refresh: () => ScrollTrigger.refresh(),
    }));

    const handleJump = (i: number) => goTo(i);

    const handleLoadedStagger = () => {
      leftItemRefs.current.forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 20 },
          { opacity: i === index ? 1 : 0.35, y: 0, duration: 0.5, delay: i * 0.06, ease: 'power3.out' }
        );
      });
      rightItemRefs.current.forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 20 },
          { opacity: i === index ? 1 : 0.35, y: 0, duration: 0.5, delay: 0.2 + i * 0.06, ease: 'power3.out' }
        );
      });
    };

    useEffect(() => {
      handleLoadedStagger();
      measureAndCenterLists(index, false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cssVars: CSSProperties = {
      ['--fx-font' as string]: fontFamily,
      ['--fx-text' as string]: colors.text ?? 'rgba(245,245,245,0.92)',
      ['--fx-overlay' as string]: colors.overlay ?? 'rgba(0,0,0,0.35)',
      ['--fx-page-bg' as string]: colors.pageBg ?? '#fff',
      ['--fx-stage-bg' as string]: colors.stageBg ?? '#000',
      ['--fx-gap' as string]: `${gap}rem`,
      ['--fx-grid-px' as string]: `${gridPaddingX}rem`,
      ['--fx-row-gap' as string]: '10px',
      ['--fx-content-cols' as string]: '1fr 2fr',
    };

    return (
      <div
        ref={(node) => {
          (rootRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={['fx', className].filter(Boolean).join(' ')}
        style={{ ...cssVars, ...style }}
        aria-label={ariaLabel}
      >
        {debug && <div className="fx-debug">Section: {index}</div>}

        <div className="fx-scroll">
          <div className="fx-fixed-section" ref={fixedSectionRef}>
            <div className="fx-fixed" ref={fixedRef}>
              {/* Backgrounds */}
              <div className="fx-bgs" aria-hidden="true">
                {sections.map((s, i) => (
                  <div className="fx-bg" key={s.id ?? i}>
                    {s.renderBackground ? (
                      s.renderBackground(index === i, lastIndexRef.current === i)
                    ) : (
                      <>
                        <img
                          ref={(el) => { if (el) bgRefs.current[i] = el; }}
                          src={s.background}
                          alt=""
                          className="fx-bg-img"
                        />
                        <div className="fx-bg-overlay" />
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="fx-grid">
                {header && <div className="fx-header" ref={headerRef}>{header}</div>}

                <div className="fx-content">
                  {/* Center title — full width, simple fade */}
                  <div className="fx-center">
                    {sections.map((s, sIdx) => (
                      <div
                        key={`C-${s.id ?? sIdx}`}
                        className="fx-featured"
                        ref={(el) => { titleRefs.current[sIdx] = el; }}
                      >
                        <h3 className="fx-featured-title">{s.title}</h3>
                      </div>
                    ))}
                  </div>


                </div>

                {/* Body text — bottom-right, never overlaps the title */}
                {hasBody && (
                  <div className="fx-body-container">
                    {sections.map((s, i) =>
                      s.body ? (
                        <div
                          key={`B-${s.id ?? i}`}
                          className="fx-body-item"
                          ref={(el) => { bodyRefs.current[i] = el; }}
                        >
                          {s.body}
                        </div>
                      ) : null
                    )}
                  </div>
                )}

                {/* Detail cards — one per section, shown for the active slide */}
                {sections.some((s) => s.details) && (
                  <div className="fx-details-container">
                    {sections.map((s, i) =>
                      s.details ? (
                        <div
                          key={`detail-${s.id ?? i}`}
                          className="fx-detail-item"
                          ref={(el) => { detailRefs.current[i] = el; }}
                        >
                          {s.details}
                        </div>
                      ) : null
                    )}
                  </div>
                )}

                {/* Footer + progress + section nav */}
                <div className="fx-footer">
                  {showProgress && (
                    <div className="fx-progress">
                      <div className="fx-progress-bar">
                        <div className="fx-progress-fill" ref={progressFillRef} />
                      </div>
                    </div>
                  )}
                  <nav className="fx-section-nav" aria-label="Slide navigation">
                    {sections.map((s, i) => (
                      <button
                        key={i}
                        className={`fx-nav-btn ${i === index ? 'active' : ''}`}
                        onClick={() => handleJump(i)}
                        aria-current={i === index ? 'true' : undefined}
                      >
                        {s.leftLabel ?? String(i + 1).padStart(2, '0')}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
        <style jsx>{`
          .fx {
            width: 100%;
            overflow: hidden;
            background: var(--fx-page-bg);
            color: #000;
            font-family: var(--fx-font);
            text-transform: uppercase;
            letter-spacing: -0.02em;
          }
          .fx-debug {
            position: fixed; bottom: 10px; right: 10px; z-index: 9999;
            background: rgba(255,255,255,0.8); color: #000; padding: 6px 8px;
            font: 12px/1 monospace; border-radius: 4px;
          }
          .fx-fixed-section { height: ${Math.max(1, total + 1)}00vh; position: relative; }
          .fx-fixed {
            position: sticky; top: 0; height: 100vh; width: 100%;
            overflow: hidden; background: var(--fx-page-bg);
          }
          .fx-grid {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            gap: var(--fx-gap);
            padding: 0 var(--fx-grid-px);
            position: relative;
            height: 100%;
            z-index: 2;
          }
          .fx-bgs { position: absolute; inset: 0; background: var(--fx-stage-bg); z-index: 1; }
          .fx-bg { position: absolute; inset: 0; }
          .fx-bg-img {
            position: absolute; inset: -10% 0 -10% 0;
            width: 100%; height: 120%; object-fit: cover;
            filter: brightness(0.75);
            opacity: 0;
            will-change: transform, opacity;
          }
          .fx-bg-overlay { position: absolute; inset: 0; background: var(--fx-overlay); }
          .fx-header {
            grid-column: 1 / 13; align-self: start; padding-top: 5vh;
            font-size: clamp(2rem, 6vw, 6rem); line-height: 0.9;
            text-align: center; color: var(--fx-text);
          }
          .fx-header > * { display: block; }
          .fx-content {
            grid-column: 1 / 13;
            position: absolute; top: 0; left: 0; right: 0; bottom: 28vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 var(--fx-grid-px);
          }
          .fx-body-container {
            grid-column: 1 / 13;
            position: absolute;
            right: var(--fx-grid-px);
            bottom: 12vh;
            width: 36%;
            max-width: 460px;
            pointer-events: none;
            z-index: 3;
          }
          .fx-body-item {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 100%;
            pointer-events: auto;
            opacity: 0;
          }
          .fx-left, .fx-right {
            height: 60vh;
            overflow: hidden;
            display: grid; align-content: center;
          }
          .fx-left { justify-items: start; }
          .fx-right { justify-items: end; }
          .fx-track { will-change: transform; }
          .fx-item {
            color: var(--fx-text);
            font-weight: 800;
            letter-spacing: 0em;
            line-height: 1;
            margin: calc(var(--fx-row-gap) / 2) 0;
            opacity: 0.35;
            transition: opacity 0.3s ease, transform 0.3s ease;
            position: relative;
            font-size: clamp(1rem, 2.4vw, 1.8rem);
            user-select: none;
            cursor: pointer;
          }
          .fx-left-item.active, .fx-right-item.active { opacity: 1; }
          .fx-left-item.active { transform: translateX(10px); padding-left: 16px; }
          .fx-right-item.active { transform: translateX(-10px); padding-right: 16px; }
          .fx-left-item.active::before,
          .fx-right-item.active::after {
            content: "";
            position: absolute; top: 50%; transform: translateY(-50%);
            width: 6px; height: 6px; background: var(--fx-text); border-radius: 50%;
          }
          .fx-left-item.active::before { left: 0; }
          .fx-right-item.active::after { right: 0; }
          .fx-center {
            position: relative;
            width: 100%; height: 100%;
          }
          .fx-featured {
            position: absolute; inset: 0;
            display: flex; align-items: center; justify-content: center;
            opacity: 0;
          }
          .fx-featured-title {
            margin: 0; color: var(--fx-text);
            font-weight: 900; letter-spacing: -0.03em;
            font-size: clamp(3.5rem, 12vw, 11rem);
            line-height: 0.9;
            text-align: center;
          }
          .fx-word-mask { display: inline-block; overflow: hidden; vertical-align: middle; }
          .fx-word { display: inline-block; vertical-align: middle; }
          .fx-details-container {
            grid-column: 1 / 13;
            position: absolute; left: 0; right: 0; top: 48vh;
            display: flex; align-items: flex-start; justify-content: flex-start;
            padding: 0 var(--fx-grid-px);
            pointer-events: none;
            z-index: 3;
          }
          .fx-detail-item {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            pointer-events: auto;
            opacity: 0;
            width: 100%;
          }
          .fx-footer {
            grid-column: 1 / 13; align-self: end; padding-bottom: 4vh; text-align: center;
          }
          .fx-progress {
            width: 160px; height: 2px; margin: 0 auto 1.5rem;
            background: rgba(245,245,245,0.2); position: relative;
          }
          .fx-progress-fill {
            position: absolute; inset: 0 auto 0 0; width: 0%;
            background: var(--fx-text); height: 100%;
          }
          .fx-section-nav {
            display: flex; gap: 2rem; justify-content: center; flex-wrap: wrap;
          }
          .fx-nav-btn {
            background: none; border: none; cursor: pointer; padding: 0.4rem 0;
            color: rgba(255,255,255,0.3); font-family: var(--fx-font);
            font-size: 0.65rem; font-weight: 700; letter-spacing: 0.18em;
            text-transform: uppercase; transition: color 0.3s ease;
          }
          .fx-nav-btn:hover { color: rgba(255,255,255,0.7); }
          .fx-nav-btn.active { color: rgba(255,255,255,0.95); }
          @media (max-width: 900px) {
            .fx-content {
              grid-template-columns: 1fr; row-gap: 3vh; place-items: center;
            }
            .fx-left, .fx-right, .fx-center { height: auto; }
            .fx-left, .fx-right { justify-items: center; }
            .fx-track { transform: none !important; }
          }
        `}</style>
      </div>
    );
  }
);

FullScreenScrollFX.displayName = 'FullScreenScrollFX';
