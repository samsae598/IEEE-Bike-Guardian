import { FullScreenScrollFX } from '@/components/ui/full-screen-scroll-fx';

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

const sections = [
  {
    id: 'rfid',
    leftLabel: 'Security',
    title: 'RFID Access',
    rightLabel: 'RC522',
    background:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1920&auto=format&fit=crop',
    details: (
      <InfoCard
        tag="RC522 Module · SPI Interface"
        stats={[
          { value: '13.56', label: 'MHz Frequency' },
          { value: 'UID', label: 'Auth Method' },
          { value: 'SPI', label: 'Protocol' },
          { value: '10', label: 'MHz Bus Speed' },
        ]}
      />
    ),
  },
  {
    id: 'tamper',
    leftLabel: 'Detection',
    title: 'Tamper Watch',
    rightLabel: 'MPU-6050',
    background:
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1920&auto=format&fit=crop',
    details: (
      <InfoCard
        tag="MPU-6050 Accelerometer · Auto-Calibrated"
        stats={[
          { value: '0.4g', label: 'Threshold' },
          { value: '8 s', label: 'Sustained Trigger' },
          { value: '50 ms', label: 'Poll Rate' },
          { value: '100×', label: 'Calibration Samples' },
        ]}
      />
    ),
  },
  {
    id: 'dashboard',
    leftLabel: 'Control',
    title: 'WiFi Panel',
    rightLabel: 'ESP32-AP',
    background:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1920&auto=format&fit=crop',
    details: (
      <InfoCard
        tag="ESP32 Access Point · Local Web Server"
        stats={[
          { value: 'AP', label: 'Mode' },
          { value: '.4.1', label: '192.168.x.x' },
          { value: 'Live', label: 'Motion Status' },
          { value: 'Reset', label: 'Alarm via Dashboard' },
        ]}
      />
    ),
  },
  {
    id: 'buzzer',
    leftLabel: 'Alert',
    title: 'Smart Alarm',
    rightLabel: 'Buzzer',
    background:
      'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?q=80&w=1920&auto=format&fit=crop',
    details: (
      <InfoCard
        tag="Passive Buzzer · Tamper-Triggered"
        stats={[
          { value: 'PWM', label: 'Drive Method' },
          { value: 'Auto', label: 'Triggers on Tamper' },
          { value: 'WiFi', label: 'Remote Reset' },
          { value: 'GPIO', label: 'Pin Control' },
        ]}
      />
    ),
  },
  {
    id: 'calibration',
    leftLabel: 'Precision',
    title: 'Auto-Calibrate',
    rightLabel: 'Baseline',
    background:
      'https://images.unsplash.com/photo-1628258334105-2a0b3d6efee1?q=80&w=1920&auto=format&fit=crop',
    details: (
      <InfoCard
        tag="Startup Calibration · Orientation-Aware"
        stats={[
          { value: '100×', label: 'Samples' },
          { value: 'Boot', label: 'Runs On' },
          { value: 'Δ Axis', label: 'Delta Tracking' },
          { value: 'Any', label: 'Mount Orientation' },
        ]}
      />
    ),
  },
];

export default function Home() {
  return (
    <main>
      <FullScreenScrollFX
        sections={sections}
        header={
          <>
            <div>Bike</div>
            <div>Guardian</div>
          </>
        }
        footer={<div>IEEE · Spring 2026</div>}
        showProgress
        durations={{ change: 0.7, snap: 800 }}
        colors={{
          text: 'rgba(248,250,252,0.92)',
          overlay: 'rgba(0,0,0,0.45)',
          pageBg: '#0F172A',
          stageBg: '#050D18',
        }}
        fontFamily="var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif"
      />
    </main>
  );
}
