'use client';

import React from 'react';
import { FullScreenScrollFX } from '@/components/ui/full-screen-scroll-fx';

function TextCard({ tag, body }: { tag: string; body: string }) {
  return (
    <div
      style={{
        background: 'rgba(0,0,0,0.6)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '1rem',
        padding: '1.25rem 1.5rem',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <p
        style={{
          color: 'rgba(255,255,255,0.35)',
          fontSize: '0.65rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          marginBottom: '0.75rem',
          fontFamily: 'monospace',
        }}
      >
        {tag}
      </p>
      <p
        style={{
          color: 'rgba(255,255,255,0.88)',
          fontSize: 'clamp(0.78rem, 1.1vw, 0.92rem)',
          lineHeight: 1.65,
          fontWeight: 400,
          margin: 0,
          textTransform: 'none',
          letterSpacing: '0.01em',
        }}
      >
        {body}
      </p>
    </div>
  );
}

function InfoCard({
  tag,
  stats,
}: {
  tag: string;
  stats: { value: string; label: string }[];
}) {
  return (
    <div
      style={{
        background: 'rgba(0,0,0,0.55)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '1rem',
        padding: '1.25rem 1.5rem',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <p
        style={{
          color: 'rgba(255,255,255,0.35)',
          fontSize: '0.65rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          marginBottom: '0.85rem',
          fontFamily: 'var(--font-dm-sans)',
        }}
      >
        {tag}
      </p>
      <div style={{ display: 'flex', gap: '2rem' }}>
        {stats.map(({ value, label }) => (
          <div key={label}>
            <div
              style={{
                color: '#fff',
                fontSize: 'clamp(1.1rem, 2.2vw, 1.5rem)',
                fontWeight: 700,
                lineHeight: 1,
                fontFamily: 'var(--font-space-grotesk)',
              }}
            >
              {value}
            </div>
            <div
              style={{
                color: 'rgba(255,255,255,0.35)',
                fontSize: '0.7rem',
                marginTop: '0.3rem',
                letterSpacing: '0.06em',
                fontFamily: 'var(--font-dm-sans)',
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const label: React.CSSProperties = {
  color: 'rgba(255,255,255,0.3)',
  fontSize: '0.6rem',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  margin: '0 0 1rem',
  fontFamily: 'inherit',
};
const body: React.CSSProperties = {
  color: 'rgba(255,255,255,0.8)',
  fontSize: 'clamp(1rem, 1.4vw, 1.15rem)',
  fontWeight: 400,
  letterSpacing: '0.01em',
  textTransform: 'none',
  lineHeight: 1.75,
  margin: 0,
  fontFamily: 'inherit',
};
const statVal: React.CSSProperties = {
  color: 'rgba(255,255,255,0.9)',
  fontSize: 'clamp(1.1rem, 1.6vw, 1.4rem)',
  fontWeight: 700,
  letterSpacing: '-0.01em',
  lineHeight: 1,
  fontFamily: 'inherit',
};
const statLbl: React.CSSProperties = {
  color: 'rgba(255,255,255,0.35)',
  fontSize: '0.65rem',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  marginTop: '0.25rem',
  fontFamily: 'inherit',
};

const sections = [
  {
    id: 'intro',
    leftLabel: 'Intro',
    title: 'Bike Guardian',
    background:
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=1920&auto=format&fit=crop',
    details: (
      <>
        <p style={label}>UCSD IEEE · Spring 2026</p>
        <p style={{ ...body, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 2.1, fontSize: 'clamp(0.85rem, 1.1vw, 1rem)' }}>
          Samuel Park<br />
          Hannah Fletcher<br />
          Yannis Smith<br />
          Abigail Romero
        </p>
      </>
    ),
  },
  {
    id: 'issue',
    leftLabel: 'Problem',
    title: 'Bike Theft',
    background:
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=1920&auto=format&fit=crop',
    details: (
      <>
        <p style={label}>The Problem</p>
        <p style={body}>
          Picture this: you wake up, head outside, and your bike is gone. No warning, no trace, nothing. At UCSD, bike theft notifications hit campus iMessage at least once a week. A standard lock cannot alert you, cannot notify you, and by the time you find out your bike is gone, it already is. On a campus this large, a bike is not a luxury. It is how you get to class on time.
        </p>
      </>
    ),
  },
  {
    id: 'solution',
    leftLabel: 'Solution',
    title: 'Smart Lock',
    background:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1920&auto=format&fit=crop',
    details: (
      <>
        <p style={label}>Our Solution</p>
        <p style={body}>
          The Smart Bike Lock solves what traditional locks cannot. Access is controlled through an RFID sensor that responds only to one authorized card. No keys, nothing to pick. The moment someone tampers with it, the alarm triggers and an alert goes straight to your phone in real time. This is not just a lock. It is a security system built for students.
        </p>
      </>
    ),
  },
  {
    id: 'tech',
    leftLabel: 'Stack',
    title: 'Technologies',
    background:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1920&auto=format&fit=crop',
    details: (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', width: '100%' }}>
          <div>
            <p style={label}>Hardware</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { value: 'ESP32', label: 'Microcontroller' },
                { value: 'Arduino UNO R3', label: 'Dev Board' },
                { value: 'PN532', label: 'NFC / RFID Module' },
                { value: '9g Micro Servo', label: 'Actuation Motor' },
                { value: '9V Battery', label: 'Power Supply' },
              ].map(s => (
                <div key={s.label} style={{
                  padding: '0.55rem 0.8rem',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.11)',
                  borderRadius: '0.5rem',
                  width: '100%',
                }}>
                  <div style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 600, letterSpacing: '0.01em' }}>{s.value}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p style={label}>Software & Design</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { value: 'Arduino C++', label: 'Firmware Language' },
                { value: 'Onshape', label: 'CAD Modeling' },
              ].map(s => (
                <div key={s.label} style={{
                  padding: '0.55rem 0.8rem',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.11)',
                  borderRadius: '0.5rem',
                  width: '100%',
                }}>
                  <div style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 600, letterSpacing: '0.01em' }}>{s.value}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'how',
    leftLabel: 'System',
    title: 'How It Works',
    background:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1920&auto=format&fit=crop',
    details: (
      <>
        <p style={label}>End-to-End Flow</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem 2rem' }}>
          {[
            { value: 'Tap', label: 'RFID Arms Lock' },
            { value: '0.4g', label: 'Tamper Triggers' },
            { value: 'Alarm', label: 'Buzzer Sounds' },
            { value: 'WiFi', label: 'Reset Remotely' },
          ].map(s => (
            <div key={s.label}>
              <div style={statVal}>{s.value}</div>
              <div style={statLbl}>{s.label}</div>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: 'future',
    leftLabel: 'Future',
    title: 'Next Steps',
    background:
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1920&auto=format&fit=crop',
    details: (
      <>
        <p style={label}>Future Updates</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem 2rem' }}>
          {[
            { value: 'GPS', label: 'Live Tracking' },
            { value: 'App', label: 'Mobile Alerts' },
            { value: 'Solar', label: 'Self-Powered' },
            { value: 'Cloud', label: 'Fleet Management' },
          ].map(s => (
            <div key={s.label}>
              <div style={statVal}>{s.value}</div>
              <div style={statLbl}>{s.label}</div>
            </div>
          ))}
        </div>
      </>
    ),
  },
];

const galleryPhotos = [
  { src: '/gallery/enclosure.jpg',          caption: 'Final Enclosure',       tall: true  },
  { src: '/gallery/rfid-module.jpg',        caption: 'RC522 Module',          tall: false },
  { src: '/gallery/assembly.jpg',           caption: 'Prototype Assembly',    tall: false },
  { src: '/gallery/components-spread.jpg',  caption: 'Component Spread',      tall: true  },
  { src: '/gallery/esp32-buzzer.jpg',       caption: 'ESP32 & Buzzer',        tall: false },
  { src: '/gallery/breadboard-prototype.jpg', caption: 'Breadboard Prototype', tall: false },
  { src: '/gallery/soldering.jpg',          caption: 'Soldering Work',        tall: false },
  { src: '/gallery/rfid-card-test.jpg',     caption: 'RFID Card Test',        tall: false },
];

function Gallery() {
  return (
    <section
      style={{
        background: '#0F172A',
        padding: '6rem 2rem 8rem',
        fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <p
          style={{
            color: 'rgba(255,255,255,0.3)',
            fontSize: '0.65rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            marginBottom: '0.6rem',
          }}
        >
          IEEE · Spring 2026
        </p>
        <h2
          style={{
            color: '#fff',
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
            lineHeight: 0.9,
            marginBottom: '3rem',
          }}
        >
          Gallery
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridAutoRows: '260px',
            gap: '0.75rem',
          }}
        >
          {galleryPhotos.map((photo, i) => (
            <div
              key={i}
              style={{
                gridRow: photo.tall ? 'span 2' : 'span 1',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '0.75rem',
                background: '#1E293B',
              }}
            >
              <img
                src={photo.src}
                alt={photo.caption}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.5s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)';
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
                  pointerEvents: 'none',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  bottom: '1rem',
                  left: '1rem',
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                {photo.caption}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <FullScreenScrollFX
        sections={sections}
        showProgress
        durations={{ change: 0.7, snap: 800 }}
        colors={{
          text: 'rgba(248,250,252,0.95)',
          overlay: 'rgba(0,0,0,0.15)',
          pageBg: '#0F172A',
          stageBg: '#050D18',
        }}
        fontFamily="var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif"
      />
      <Gallery />
    </main>
  );
}
