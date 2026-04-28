'use client';

export default function GradientBlobs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>

      {/* ===== SPEC: 5 ORGANIC BLOBS ===== */}
      {/* Blob 1 — top-left */}
      <div className="blob" style={{
        top: '-60px', left: '-60px',
        width: 380, height: 380,
        animationDuration: '10s',
        animationDelay: '0s',
      }} />
      {/* Blob 2 — top-right, pink tinted */}
      <div className="blob" style={{
        top: '-40px', right: '-80px',
        width: 320, height: 320,
        background: 'radial-gradient(circle, #FF7ACD, #5B3DF5, #3A8DFF)',
        animationDuration: '12s',
        animationDelay: '-3s',
      }} />
      {/* Blob 3 — bottom-left, orange tinted */}
      <div className="blob" style={{
        bottom: '-60px', left: '10%',
        width: 340, height: 340,
        background: 'radial-gradient(circle, #FFB86C, #FF7ACD, #5B3DF5)',
        animationDuration: '14s',
        animationDelay: '-5s',
      }} />
      {/* Blob 4 — bottom-right */}
      <div className="blob" style={{
        bottom: '-80px', right: '-40px',
        width: 300, height: 300,
        background: 'radial-gradient(circle, #3A8DFF, #5CF2E3, #5B3DF5)',
        animationDuration: '11s',
        animationDelay: '-7s',
      }} />
      {/* Blob 5 — center floating */}
      <div className="blob" style={{
        top: '35%', left: '38%',
        width: 260, height: 260,
        background: 'radial-gradient(circle, #5B3DF5, #FF7ACD, #5CF2E3)',
        animationDuration: '16s',
        animationDelay: '-2s',
        opacity: 0.35,
      }} />

      {/* ===== SPEC: MAIN HERO ORB ===== */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1,
      }}>
        <div className="orb" />
      </div>

      {/* ===== SPEC: DOT GRIDS ===== */}
      <div className="dots" style={{ top: '8%', left: '20%', width: 120, height: 120 }} />
      <div className="dots" style={{ bottom: '12%', right: '18%', width: 100, height: 100 }} />
      <div className="dots" style={{ top: '55%', right: '8%', width: 80, height: 80, opacity: 0.15 }} />

      {/* ===== SPEC: FLOATING PARTICLES / CROSSES ===== */}
      {[
        { top: '12%', left: '35%', color: '#FFB86C', size: 20, delay: '0s', dur: '5s' },
        { top: '22%', right: '28%', color: '#FF7ACD', size: 16, delay: '-2s', dur: '7s' },
        { top: '68%', left: '25%', color: '#5CF2E3', size: 14, delay: '-4s', dur: '6s' },
        { bottom: '25%', right: '30%', color: '#FFB86C', size: 12, delay: '-1s', dur: '8s' },
        { top: '40%', left: '12%', color: '#FF7ACD', size: 10, delay: '-3s', dur: '9s' },
        { top: '78%', right: '12%', color: '#5CF2E3', size: 14, delay: '-6s', dur: '5.5s' },
      ].map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: (s as any).top,
          left: (s as any).left,
          right: (s as any).right,
          bottom: (s as any).bottom,
          color: s.color,
          fontSize: s.size,
          opacity: 0.85,
          animation: `float ${s.dur} ease-in-out infinite`,
          animationDelay: s.delay,
          textShadow: `0 0 10px ${s.color}`,
          pointerEvents: 'none',
          zIndex: 2,
        }}>✦</div>
      ))}

      {/* ===== SPEC: LIGHT STREAK accent ===== */}
      <div style={{
        position: 'absolute',
        width: '250px', height: '2px',
        background: 'linear-gradient(90deg, transparent, rgba(92,242,227,0.7), transparent)',
        bottom: '20%', right: '8%',
        transform: 'rotate(-30deg)',
        filter: 'blur(2px)',
        animation: 'float 8s ease-in-out infinite',
        animationDelay: '-4s',
        zIndex: 2,
      }} />
      <div style={{
        position: 'absolute',
        width: '160px', height: '1.5px',
        background: 'linear-gradient(90deg, transparent, rgba(255,122,205,0.6), transparent)',
        bottom: '23%', right: '10%',
        transform: 'rotate(-30deg)',
        filter: 'blur(1.5px)',
        animation: 'float 10s ease-in-out infinite',
        animationDelay: '-6s',
        zIndex: 2,
      }} />

    </div>
  );
}
