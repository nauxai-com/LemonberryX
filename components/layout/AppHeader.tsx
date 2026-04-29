'use client';

function getWeekLabel() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diff);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(mon)} – ${fmt(sun)}, ${sun.getFullYear()}`;
}

export default function AppHeader() {
  return (
    <header className="app-header">
      <div className="logo">
        <div className="logo-mark">LX</div>
        <div className="logo-text">LemonberryX</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div className="week-badge">
          Week of{' '}
          <strong style={{ color: 'var(--lemon)', fontFamily: 'Dropline, sans-serif' }}>
            {getWeekLabel()}
          </strong>
          {' · '}Target{' '}
          <strong style={{ color: 'var(--lemon)', fontFamily: 'Dropline, sans-serif' }}>3.5h</strong>/wk
        </div>
        <div className="pulse-dot" title="CH-01 LIVE" />
      </div>
    </header>
  );
}
