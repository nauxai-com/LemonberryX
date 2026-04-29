'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Channel, QueueItem } from '@/lib/supabase/types';
import AddVideoModal from '@/components/queue/AddVideoModal';

const STATUS_OPTIONS = ['Queued', 'In Progress', 'Scripted', 'Filmed', 'Live'];

function supabaseStatusToCard(status: string): string {
  const map: Record<string, string> = {
    idea: 'Queued', research: 'In Progress',
    script: 'Scripted', production: 'Filmed', done: 'Live',
  };
  return map[status] || 'Queued';
}

function getStatusBarBg(status: string): string {
  switch (status) {
    case 'Live':        return 'var(--mint)';
    case 'Scripted':    return 'var(--violet)';
    case 'In Progress': return 'linear-gradient(90deg, var(--lemon), var(--berry))';
    case 'Filmed':      return '#4DC8FF';
    default:            return 'rgba(255,255,255,0.12)';
  }
}

export default function QueuePage() {
  const [items, setItems]       = useState<QueueItem[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [filter, setFilter]     = useState('all');
  const [search, setSearch]     = useState('');
  const [showAdd, setShowAdd]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const [cardStatus, setCardStatus] = useState<Record<string, string>>({});
  const [cardNotes, setCardNotes]   = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const s = localStorage.getItem('lbx:qcard-statuses');
      const n = localStorage.getItem('lbx:qcard-notes');
      if (s) setCardStatus(JSON.parse(s));
      if (n) setCardNotes(JSON.parse(n));
    } catch {}
  }, []);

  const load = async () => {
    const [{ data: q }, { data: c }] = await Promise.all([
      supabase.from('queue').select('*, channels(name)').order('day_number'),
      supabase.from('channels').select('*'),
    ]);
    setItems(q || []);
    setChannels(c || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = (id: string, status: string) => {
    const next = { ...cardStatus, [id]: status };
    setCardStatus(next);
    localStorage.setItem('lbx:qcard-statuses', JSON.stringify(next));
  };

  const updateNotes = (id: string, notes: string) => {
    const next = { ...cardNotes, [id]: notes };
    setCardNotes(next);
    localStorage.setItem('lbx:qcard-notes', JSON.stringify(next));
  };

  const filtered = items.filter(i => {
    const matchChannel = filter === 'all' || (i as any).channels?.name === filter;
    const matchSearch  = !search || i.title.toLowerCase().includes(search.toLowerCase());
    return matchChannel && matchSearch;
  });

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div>
          <p className="section-title" style={{ marginBottom: 4 }}>Grimm Archives — 30-Day Content Queue</p>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Dropline, sans-serif' }}>
            CH-01 · {items.length} videos
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginLeft: 'auto', alignItems: 'center' }}>
          {['all', ...channels.map(c => c.name)].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '4px 14px', borderRadius: 999, fontSize: 11,
                cursor: 'pointer', fontFamily: 'Dropline, sans-serif',
                background: filter === f ? 'rgba(112,72,248,0.3)' : 'rgba(255,255,255,0.05)',
                border: filter === f ? '1px solid rgba(112,72,248,0.5)' : '1px solid var(--border)',
                color: filter === f ? 'var(--text)' : 'var(--text-muted)',
                transition: 'all 0.2s',
              }}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
          <input
            style={{
              padding: '6px 12px', fontSize: 12, borderRadius: 8, width: 180,
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
              color: 'var(--text)', fontFamily: 'Dropline, sans-serif',
            }}
            placeholder="Search titles…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            onClick={() => setShowAdd(true)}
            style={{
              padding: '7px 18px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: 'var(--violet)', color: '#fff', border: 'none', cursor: 'pointer',
              fontFamily: 'ChargerExtrabold, Outfit, sans-serif', textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            + Add Video
          </button>
        </div>
      </div>

      {/* Card grid */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[...Array(9)].map((_, i) => (
              <div key={i} style={{ height: 210, borderRadius: 12, background: 'var(--card)', opacity: 0.5 }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {filtered.map(item => {
              const status = cardStatus[item.id] || supabaseStatusToCard(item.status || 'idea');
              const notes  = cardNotes[item.id] ?? (item.notes || '');
              return (
                <div
                  key={item.id}
                  style={{
                    background: 'rgba(20,12,48,0.92)',
                    border: '1px solid var(--border)',
                    borderRadius: 12, overflow: 'hidden',
                    display: 'flex', flexDirection: 'column',
                    transition: 'border-color 0.2s, transform 0.15s',
                  }}
                >
                  {/* Status accent bar */}
                  <div style={{ height: 2, background: getStatusBarBg(status), flexShrink: 0 }} />

                  <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Day + score */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        background: 'rgba(112,72,248,0.15)', color: 'var(--violet-light)',
                        borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 700,
                        fontFamily: 'Dropline, sans-serif', letterSpacing: '0.1em',
                        border: '1px solid rgba(112,72,248,0.25)',
                      }}>
                        D{item.day_number != null ? String(item.day_number).padStart(2, '0') : '??'}
                      </span>
                      <span style={{
                        color: 'var(--lemon)', fontSize: 10, fontWeight: 700,
                        fontFamily: 'Dropline, sans-serif',
                      }}>
                        {item.compliance_score != null ? `${item.compliance_score}/10` : '—/10'}
                      </span>
                    </div>

                    {/* Title */}
                    <div style={{
                      fontFamily: 'Dropline, sans-serif', fontWeight: 700,
                      fontSize: 13, color: 'var(--text)', lineHeight: 1.45, flex: 1,
                    }}>
                      {item.title}
                    </div>

                    {/* Status dropdown */}
                    <select
                      value={status}
                      onChange={e => updateStatus(item.id, e.target.value)}
                      style={{
                        width: '100%', padding: '6px 10px', borderRadius: 8, fontSize: 11,
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(112,72,248,0.25)',
                        color: 'var(--text)', cursor: 'pointer', fontFamily: 'Dropline, sans-serif',
                      }}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s} style={{ background: '#1C1635' }}>{s}</option>
                      ))}
                    </select>

                    {/* Notes */}
                    <input
                      value={notes}
                      onChange={e => updateNotes(item.id, e.target.value)}
                      placeholder="Add notes…"
                      style={{
                        width: '100%', padding: '6px 10px', borderRadius: 8, fontSize: 11,
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(140,100,255,0.15)',
                        color: 'var(--text-muted)', fontFamily: 'Dropline, sans-serif',
                      }}
                    />
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{
                gridColumn: '1 / -1', textAlign: 'center',
                padding: '64px 0', color: 'var(--text-dim)',
                fontSize: 14, fontFamily: 'Dropline, sans-serif',
              }}>
                No videos match this filter.
              </div>
            )}
          </div>
        )}
      </div>

      {showAdd && (
        <AddVideoModal
          channels={channels}
          onClose={() => setShowAdd(false)}
          onSave={() => { setShowAdd(false); load(); }}
        />
      )}
    </div>
  );
}
