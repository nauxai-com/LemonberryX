'use client';
interface TopBarProps { title: string; subtitle?: string; }
export default function TopBar({ title, subtitle }: TopBarProps) {
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  return (
    <div className="flex items-center justify-between px-8 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div>
        <h1 className="text-2xl" style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 26 }}>{title}</h1>
        {subtitle && <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{subtitle}</p>}
      </div>
      <div className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>{date}</div>
    </div>
  );
}
