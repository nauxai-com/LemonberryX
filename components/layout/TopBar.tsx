'use client';

interface TopBarProps { title: string; subtitle?: string; }

export default function TopBar({ title, subtitle }: TopBarProps) {
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  return (
    <div className="header" style={{ marginBottom: 24 }}>
      <div className="title-block">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="date">{date}</div>
    </div>
  );
}
