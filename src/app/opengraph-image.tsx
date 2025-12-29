import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = "Slobo's Dashboard - DoorDash Recovery Tracker";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#09090b',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Vignette effect */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.7) 100%)',
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div style={{ color: 'rgba(239, 68, 68, 0.6)', fontSize: 24 }}>●</div>
          <div
            style={{
              color: '#a1a1aa',
              fontSize: 24,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            DoorDash Recovery
          </div>
          <div style={{ color: 'rgba(239, 68, 68, 0.6)', fontSize: 24 }}>●</div>
        </div>

        {/* Timer display */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 180,
            fontWeight: 'bold',
            color: 'white',
            textShadow: '0 0 60px rgba(239, 68, 68, 0.4)',
          }}
        >
          <span>00</span>
          <span style={{ color: '#ef4444', margin: '0 8px' }}>:</span>
          <span>00</span>
          <span style={{ color: '#ef4444', margin: '0 8px' }}>:</span>
          <span>00</span>
        </div>

        {/* Labels */}
        <div
          style={{
            display: 'flex',
            gap: 120,
            color: '#52525b',
            fontSize: 18,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginTop: 16,
          }}
        >
          <span>hours</span>
          <span>minutes</span>
          <span>seconds</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            color: '#71717a',
            fontSize: 28,
            fontStyle: 'italic',
            marginTop: 40,
          }}
        >
          &quot;one order at a time&quot;
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            color: '#3f3f46',
            fontSize: 20,
          }}
        >
          dashboard.slobo.xyz
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
