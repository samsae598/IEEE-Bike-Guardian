'use client';

import React from 'react';
import { FullScreenScrollFX } from '@/components/ui/full-screen-scroll-fx';


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
          Hannah Fletcher
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
          Picture this: you wake up, head outside, and your bike or scooter is gone. No warning, no trace, nothing. At UCSD, this is not hypothetical. Bike theft notifications hit campus iMessage at least once every week, and it hits close to home. My own roommate had his scooter stolen this past winter quarter, with a lock on it.
        </p>
        <p style={{ ...body, marginTop: '0.85rem' }}>
          The problem is not that students are careless. It is that the tools they have are passive and outdated. A standard lock cannot alert you, cannot notify you, and by the time you find out your bike is gone, it already is. On a campus this large, a bike is not a luxury. It is how you get to class on time. Losing it means losing your day. This is exactly the kind of problem that the Spring 2026 Quarterly Projects theme of safety and security was made for, and this is the problem we set out to solve.
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
          The Smart Bike Lock solves what traditional locks cannot. Access is controlled through an RFID sensor that responds only to one authorized card. No keys, nothing to pick. The moment someone tampers with it, the alarm triggers and an alert goes straight to your phone in real time. Whether you are in lecture or across campus, you always know. You always have a chance to respond.
        </p>
        <p style={{ ...body, marginTop: '0.85rem' }}>
          This is not just a lock. It is a security system built for students.
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
        <p style={label}>Stack and Materials</p>
        <p style={body}>
          For the software side, we designed the enclosure using Onshape for CAD and wrote all of our code in C++ through the Arduino IDE.
        </p>
        <p style={{ ...body, marginTop: '0.85rem' }}>
          On the hardware side, the build consists of a PN532 NFC RFID module for card scanning, an Arduino Uno R3 to handle the locking mechanism, an ESP32 to run the WiFi dashboard, an MPU-6050 accelerometer for motion detection, a buzzer module for the alarm, a 9g micro servo motor to physically operate the lock, and 9 volt batteries to power the system independently without needing to be plugged in.
        </p>
      </>
    ),
  },
  {
    id: 'how',
    leftLabel: 'System',
    title: 'How It Works',
    background:
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1920&auto=format&fit=crop',
    details: (
      <>
        <p style={label}>End-to-End Flow</p>
        <p style={{ ...body, fontSize: 'clamp(0.82rem, 1.1vw, 0.96rem)' }}>
          Every RFID card, including any card with a microchip such as our UCSD student IDs, carries a Unique Identifier burned into it that never changes. To assign the lock we first had to find those numbers. We built a simple card reader that scanned each card and printed the UID directly into a serial monitor, giving us the exact values we needed. Once programmed in, the module compares every scan against that stored value. A match rotates the servo and the lock opens. If it does not match, nothing happens. No key, no combination. The only thing that opens this lock is the one card it was assigned to.
        </p>
        <p style={{ ...body, marginTop: '0.75rem', fontSize: 'clamp(0.82rem, 1.1vw, 0.96rem)' }}>
          For the security side, an MPU-6050 accelerometer continuously monitors the lock for motion. It establishes a reference point, then continuously compares each new reading to the last. Once it detects change in movement, whether from tinkering, shaking, or tampering, it registers the disturbance. If that motion is sustained, the alarm triggers.
        </p>
        <p style={{ ...body, marginTop: '0.75rem', fontSize: 'clamp(0.82rem, 1.1vw, 0.96rem)' }}>
          At that point the ESP32 takes over. It hosts a complete HTML page directly from the board. When you connect to its WiFi network and open a browser, that page loads instantly and begins polling the device every second, updating your screen with the current motion status, alarm state, and a live event log in real time. You can reset the alarm remotely straight from the page. No internet, no downloads, just a live security dashboard served from a microcontroller the size of your palm.
        </p>
      </>
    ),
  },
  {
    id: 'difficulties',
    leftLabel: 'Difficulties',
    title: 'Difficulties',
    background:
      'https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=1920&auto=format&fit=crop',
    details: (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem 3rem', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <p style={{ ...label, marginBottom: '0.4rem' }}>RFID Modules</p>
              <p style={{ ...body, fontSize: 'clamp(0.78rem, 1vw, 0.88rem)' }}>
                Cheap Amazon modules would work for an hour then stop responding entirely. One became unusable after desoldering during enclosure fitting. A PN532 donated by a friend from the ECE tutoring center saved the project. It was reliable and capable of reading cards through plastic. Soldering it in, knowing it was our last sensor, was nerve-wracking.
              </p>
            </div>
            <div>
              <p style={{ ...label, marginBottom: '0.4rem' }}>Motion Sensor</p>
              <p style={{ ...body, fontSize: 'clamp(0.78rem, 1vw, 0.88rem)' }}>
                The MPU-6050 kept interpreting changes in orientation as active motion. If the lock was mounted at a different angle than where it calibrated, the alarm would fire even while perfectly still. On top of that, the alarm would continue triggering after resetting it through the browser. Getting the calibration and reset logic right took the most debugging time of anything in this project.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <p style={{ ...label, marginBottom: '0.4rem' }}>Teamwork</p>
              <p style={{ ...body, fontSize: 'clamp(0.78rem, 1vw, 0.88rem)' }}>
                Our teammates were often unresponsive despite our attempts to communicate meeting times. Unfortunately, due to inactivity and lack of communication throughout our team, this project ultimately led to be a 2 person project. Had our teammates have been more cooperative, we feel that we would've achieved a lot more with our product.
              </p>
            </div>
            <div>
              <p style={{ ...label, marginBottom: '0.4rem' }}>Lock Mechanism</p>
              <p style={{ ...body, fontSize: 'clamp(0.78rem, 1vw, 0.88rem)' }}>
                Designing a locking mechanism around a single servo was its own challenge. We had to ensure the lock could not be forced open by manually rotating the rod. A few wires also snapped during prototyping, which we fixed by soldering onto adjacent pins on the same breadboard branch.
              </p>
            </div>
          </div>
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
        <p style={body}>
          Working under a $25 budget meant compromises. Given more time and resources, here is what we would build next.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 3rem', marginTop: '1rem', width: '100%' }}>
          {[
            {
              value: 'Internet WiFi',
              label: 'Connect the ESP32 to the internet so alerts push directly to your phone from anywhere on campus, not just within range of the board.',
            },
            {
              value: 'Sturdier Lock',
              label: 'Redesign with a proper interlocking mechanism. The current servo-based design works but someone determined could force it open.',
            },
            {
              value: 'Smaller Enclosure',
              label: 'Shrink the housing down to a compact form factor that is practical to mount on an actual bike and harder to spot.',
            },
            {
              value: 'Motion Calibration',
              label: 'Fine tune the sensitivity so the alarm distinguishes real tampering from innocent movement like wind or foot traffic.',
            },
          ].map(s => (
            <div key={s.value} style={{
              padding: '0.7rem 0.9rem',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '0.5rem',
            }}>
              <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.88rem', lineHeight: 1.55, letterSpacing: '0.01em', textTransform: 'none' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </>
    ),
  },
];

const galleryPhotos = [
  { src: '/gallery/enclosure.jpg',          caption: 'Final Enclosure',       tall: true  },
  { src: '/gallery/rfid-module.jpg',        caption: 'PN532 NFC RFID Module',          tall: false },
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
          overlay: 'rgba(0,0,0,0.22)',
          pageBg: '#0F172A',
          stageBg: '#050D18',
        }}
        fontFamily="var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif"
      />
      <Gallery />
    </main>
  );
}
