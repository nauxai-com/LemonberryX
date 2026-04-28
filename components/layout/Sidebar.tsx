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
    <aside
      className="flex flex-col shrink-0 h-full relative z-20"
      style={{
        width: 220,
        background: 'rgba(19,16,42,0.85)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 py-6">
        <span className="logo-3d text-2xl">🍋</span>
        <span className="brand-name">LemonberryX</span>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0 16px' }} />

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3 pt-4 flex-1">
        {nav.map(({ href, icon, label, badge }) => {
          const active = path === href || (href !== '/dashboard' && path.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200"
              style={{
                color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                ...(active ? {} : {}),
              }}
            >
              {active && (
                <span
                  className="absolute inset-0 rounded-xl nav-active"
                  style={{ position: 'absolute' }}
                />
              )}
              <span
                className="relative flex items-center gap-3 w-full"
                style={active ? {
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.35), rgba(217,70,239,0.25))',
                  borderRadius: 10,
                  padding: '8px 12px',
                  border: '1px solid rgba(124,58,237,0.3)',
                  boxShadow: '0 0 12px rgba(124,58,237,0.2)',
                  margin: '-8px -12px',
                } : { padding: '0' }}
              >
                <span>{icon}</span>
                <span>{label}</span>
                {badge && (
                  <span
                    className="ml-auto text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(124,58,237,0.3)', color: '#D946EF' }}
                  >
                    {badge}
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom decoration */}
      <div className="px-4 pb-6">
        <div
          className="rounded-xl p-3 text-center"
          style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}
        >
          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Grimm Archives</div>
          <div className="text-xs font-semibold" style={{ color: '#10B981' }}>● LIVE</div>
        </div>
      </div>
    </aside>
  );
}
