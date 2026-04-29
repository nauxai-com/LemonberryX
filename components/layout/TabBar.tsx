'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { num: '01', label: 'Channels',         path: '/dashboard' },
  { num: '02', label: 'Pipeline',          path: '/pipeline' },
  { num: '03', label: 'Queue',             path: '/queue' },
  { num: '04', label: 'Script Engine',     path: '/script' },
  { num: '05', label: 'Tools',             path: '/tools' },
  { num: '06', label: 'Compliance Shield', path: '/compliance' },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="tab-bar">
      {TABS.map(tab => {
        const isActive =
          pathname === tab.path ||
          (tab.path === '/dashboard' && (pathname === '/' || pathname === ''));
        return (
          <Link
            key={tab.path}
            href={tab.path}
            className={`tab-btn ${isActive ? 'active' : ''}`}
          >
            {tab.num} · {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
