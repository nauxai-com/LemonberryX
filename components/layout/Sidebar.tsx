'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/dashboard',  icon: '📺', label: 'Dashboard' },
  { href: '/queue',      icon: '📋', label: 'Queue',         badge: 30 },
  { href: '/pipeline',   icon: '⚙️',  label: 'Pipeline' },
  { href: '/script',     icon: '✍️',  label: 'Script Engine' },
  { href: '/compliance', icon: '🛡️',  label: 'Compliance' },
  { href: '/tools',      icon: '🔧', label: 'Tools' },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="sidebar">
      <div className="logo">🍋 LemonberryX</div>

      <nav>
        {nav.map(({ href, icon, label, badge }) => {
          const active = path === href || (href !== '/dashboard' && path.startsWith(href));
          return (
            <Link key={href} href={href} className={active ? 'active' : ''}>
              <span>{icon}</span>
              <span style={{ flex: 1 }}>{label}</span>
              {badge && (
                <span style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: 'rgba(91,61,245,0.35)',
                  color: '#FF7ACD',
                  fontFamily: 'Dropline, sans-serif',
                }}>
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-bottom" style={{ marginTop: 'auto' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Grimm Archives</div>
        <div style={{ color: '#10B981', fontSize: 12, fontWeight: 600, marginTop: 2 }}>● LIVE</div>
      </div>
    </aside>
  );
}
