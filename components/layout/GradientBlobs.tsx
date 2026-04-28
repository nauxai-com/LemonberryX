'use client';

export default function GradientBlobs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>

      {/* === BASE GRADIENT BACKGROUND === */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 120% 100% at 70% 20%, #f5a76c44 0%, transparent 55%), radial-gradient(ellipse 80% 80% at 10% 50%, #7c22d688 0%, transparent 60%), radial-gradient(ellipse 100% 80% at 80% 90%, #1e40af55 0%, transparent 55%), radial-gradient(ellipse 60% 60% at 30% 80%, #9333ea66 0%, transparent 50%)',
      }} />

      {/* === WARM LIGHT BLOOM — upper right === */}
      <div style={{
        position: 'absolute',
        width: 700, height: 500,
        top: '-80px', right: '0px',
        background: 'radial-gradient(circle, #fcd6a4cc 0%, #f59e4a88 30%, transparent 70%)',
        filter: 'blur(60px)',
        borderRadius: '50%',
      }} />

      {/* === LARGE PURPLE BLOB — center-left === */}
      <div style={{
        position: 'absolute',
        width: 650, height: 650,
        top: '10%', left: '-5%',
        background: 'radial-gradient(circle, #a855f7cc 0%, #7c3aed99 50%, transparent 75%)',
        filter: 'blur(50px)',
        borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%',
        animation: 'drift 18s ease-in-out infinite alternate',
      }} />

      {/* === MAGENTA/PINK BLOB — lower left === */}
      <div style={{
        position: 'absolute',
        width: 500, height: 500,
        bottom: '-5%', left: '5%',
        background: 'radial-gradient(circle, #e879f9bb 0%, #c026d399 50%, transparent 75%)',
        filter: 'blur(55px)',
        borderRadius: '40% 60% 45% 55% / 55% 45% 60% 40%',
        animation: 'drift 22s ease-in-out infinite alternate-reverse',
      }} />

      {/* === BLUE/TEAL BLOB — bottom right === */}
      <div style={{
        position: 'absolute',
        width: 450, height: 450,
        bottom: '-10%', right: '-5%',
        background: 'radial-gradient(circle, #22d3eeaa 0%, #0891b288 50%, transparent 75%)',
        filter: 'blur(60px)',
        borderRadius: '50% 50% 40% 60% / 40% 60% 55% 45%',
        animation: 'drift 25s ease-in-out infinite alternate',
        animationDelay: '5s',
      }} />

      {/* === LIQUID AMOEBA SHAPE — right floating === */}
      <div style={{
        position: 'absolute',
        width: 280, height: 320,
        top: '25%', right: '8%',
        background: 'linear-gradient(135deg, #a855f7ee 0%, #6d28d9cc 40%, #c026d3aa 100%)',
        borderRadius: '63% 37% 54% 46% / 55% 48% 52% 45%',
        filter: 'blur(2px)',
        animation: 'liquidFloat 8s ease-in-out infinite',
        boxShadow: '0 0 60px #a855f766, inset 0 0 40px rgba(255,255,255,0.1)',
      }} />

      {/* === LIQUID AMOEBA SHAPE — bottom left floating === */}
      <div style={{
        position: 'absolute',
        width: 220, height: 260,
        bottom: '15%', left: '12%',
        background: 'linear-gradient(135deg, #7c3aeddd 0%, #a855f7bb 50%, #6d28d9aa 100%)',
        borderRadius: '37% 63% 46% 54% / 48% 55% 45% 52%',
        filter: 'blur(2px)',
        animation: 'liquidFloat 10s ease-in-out infinite reverse',
        animationDelay: '3s',
        boxShadow: '0 0 50px #7c3aed55, inset 0 0 30px rgba(255,255,255,0.08)',
      }} />

      {/* === GLOWING SPHERE — center-right === */}
      <div style={{
        position: 'absolute',
        width: 140, height: 140,
        top: '38%', right: '22%',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.4) 0%, #c084fc 30%, #7c3aed 60%, #4c1d95 100%)',
        boxShadow: '0 0 40px #a855f7, 0 0 80px #7c3aed66, inset 0 0 20px rgba(255,255,255,0.2)',
        animation: 'liquidFloat 7s ease-in-out infinite',
        animationDelay: '1s',
      }} />

      {/* === DOT GRID — upper left === */}
      <div style={{
        position: 'absolute',
        width: 160, height: 160,
        top: '12%', left: '18%',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.35) 1.5px, transparent 1.5px)',
        backgroundSize: '18px 18px',
        opacity: 0.6,
      }} />

      {/* === DOT GRID — lower right === */}
      <div style={{
        position: 'absolute',
        width: 120, height: 120,
        bottom: '22%', right: '15%',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1.5px, transparent 1.5px)',
        backgroundSize: '16px 16px',
        opacity: 0.5,
      }} />

      {/* === STAR CROSS — upper area === */}
      <div style={{
        position: 'absolute',
        top: '8%', right: '32%',
        color: '#fbbf24',
        fontSize: 22,
        opacity: 0.9,
        animation: 'liquidFloat 5s ease-in-out infinite',
        textShadow: '0 0 10px #f59e0b',
      }}>✦</div>
      <div style={{
        position: 'absolute',
        top: '18%', left: '42%',
        color: '#f0abfc',
        fontSize: 16,
        opacity: 0.8,
        animation: 'liquidFloat 7s ease-in-out infinite reverse',
        animationDelay: '2s',
        textShadow: '0 0 8px #e879f9',
      }}>✦</div>
      <div style={{
        position: 'absolute',
        bottom: '30%', right: '35%',
        color: '#67e8f9',
        fontSize: 14,
        opacity: 0.7,
        animation: 'liquidFloat 6s ease-in-out infinite',
        animationDelay: '4s',
        textShadow: '0 0 8px #22d3ee',
      }}>✦</div>
      <div style={{
        position: 'absolute',
        top: '55%', left: '8%',
        color: '#fbbf24',
        fontSize: 12,
        opacity: 0.6,
        animation: 'liquidFloat 9s ease-in-out infinite reverse',
        animationDelay: '1s',
      }}>✦</div>

      {/* === DIAGONAL ACCENT LINE === */}
      <div style={{
        position: 'absolute',
        width: 200, height: 3,
        bottom: '18%', right: '10%',
        background: 'linear-gradient(90deg, transparent, #06b6d4cc, transparent)',
        borderRadius: 2,
        transform: 'rotate(-25deg)',
        filter: 'blur(1px)',
        opacity: 0.7,
      }} />
      <div style={{
        position: 'absolute',
        width: 140, height: 2,
        bottom: '22%', right: '12%',
        background: 'linear-gradient(90deg, transparent, #a78bfa99, transparent)',
        borderRadius: 2,
        transform: 'rotate(-25deg)',
        filter: 'blur(1px)',
        opacity: 0.6,
      }} />

    </div>
  );
}
