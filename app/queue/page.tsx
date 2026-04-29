'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Channel, QueueItem } from '@/lib/supabase/types';
import TopBar from '@/components/layout/TopBar';
import AddVideoModal from '@/components/queue/AddVideoModal';

const STATUS_OPTIONS = ['Queued', 'In Progress', 'Scripted', 'Filmed', 'Live'];

function supabaseStatusToCard(status: string): string {
  const map: Record<string, string> = {
    idea: 'Queued',
    research: 'In Progress',
    script: 'Scripted',
    production: 'Filmed',
    done: 'Live',
  };
  return map[status] || 'Queued';
}

function getStatusBarBg(status: string): string {
  switch (status) {
    case 'Live':        return '#10B981';
    case 'Scripted':    return '#7C3AED';
    case 'In Progress': return 'linear-gradient(90deg, #F59E0B, #D946EF)';
    case 'Filmed':      return '#06B6D4';
    default:            return 'rgba(255,255,255,0.12)';
  }
}

export default function QueuePage() {
  const [items, setItems]         = useState<QueueItem[]>([]);
  const [channels, setChannels]   = useState<Channel[]>([]);
  const [filter, setFilter]       = useState('all');
  const [search, setSearch]       = useState('');
  const [showAdd, setShowAdd]     = useState(false);
  const [loading, setLoading]     = useState(true);
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

  const scriptReady = items.filter(i => i.status === 'script').length;
  const researched  = items.filter(i => i.status === 'research').length;
  const ideas       = items.filter(i => i.status === 'idea').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <TopBar title="Content Queue" subtitle={`${items.length} videos`} />

      {/* Filters + Search */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10,
        padding: '14px 0 18px', borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {['all', ...channels.map(c => c.name)].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '4px 14px', borderRadius: 999, fontSize: 12, cursor: 'pointer',
                background: filter === f ? 'rgba(124,58,237,0.35)' : 'rgba(255,255,255,0.06)',
                border: filter === f ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,255,255,0.1)',
                color: filter === f ? '#fff' : 'rgba(255,255,255,0.55)',
                transition: 'all 0.2s',
              }}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
          <span className="badge badge-script">{scriptReady} Script ready</span>
          <span className="badge badge-research">{researched} Researched</span>
          <span className="badge badge-idea">{ideas} Ideas</span>
        </div>
        <input
          style={{
            marginLeft: 'auto', padding: '6px 12px', fontSize: 13, borderRadius: 8, width: 200,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
          }}
          placeholder="Search titles…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button
          onClick={() => setShowAdd(true)}
          style={{
            padding: '6px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: 'linear-gradient(135deg,#7C3AED,#D946EF)', color: '#fff',
            border: 'none', cursor: 'pointer',
          }}
        >
          + Add Video
        </button>
      </div>

      {/* 3-Column Card Grid */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 22 }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            {[...Array(9)].map((_, i) => (
              <div key={i} style={{
                height: 210, borderRadius: 12,
                background: 'rgba(255,255,255,0.04)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            {filtered.map(item => {
              const status = cardStatus[item.id] || supabaseStatusToCard(item.status || 'idea');
              const notes  = cardNotes[item.id] ?? (item.notes || '');
              return (
                <div
                  key={item.id}
                  style={{
                    background: 'rgba(20,12,48,0.92)',
                    border: '1px solid rgba(140,100,255,0.18)',
                    borderRadius: 12,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  {/* Top status bar */}
                  <div style={{ height: 3, background: getStatusBarBg(status), flexShrink: 0 }} />

                  <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Day badge + compliance score */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        background: 'rgba(124,58,237,0.3)', color: '#a78bfa',
                        borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700,
                        fontFamily: 'Dropline, sans-serif', letterSpacing: '0.05em',
                      }}>
                        D{item.day_number != null ? String(item.day_number).padStart(2, '0') : '??'}
                      </span>
                      <span style={{
                        color: '#F59E0B', fontSize: 11, fontWeight: 700,
                        fontFamily: 'Dropline, sans-serif',
                      }}>
                        {item.compliance_score != null ? `${item.compliance_score}/10` : '—/10'}
                      </span>
                    </div>

                    {/* Title */}
                    <div style={{
                      fontWeight: 700, fontSize: 13, color: '#fff',
                      lineHeight: 1.45, flex: 1,
                      fontFamily: 'Dropline, sans-serif',
                    }}>
                      {item.title}
                    </div>

                    {/* Status dropdown */}
                    <select
                      value={status}
                      onChange={e => updateStatus(item.id, e.target.value)}
                      style={{
                        width: '100%', padding: '6px 10px', borderRadius: 8, fontSize: 12,
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(140,100,255,0.25)',
                        color: '#fff', cursor: 'pointer', fontFamily: 'Dropline, sans-serif',
                      }}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    {/* Notes input */}
                    <input
                      value={notes}
                      onChange={e => updateNotes(item.id, e.target.value)}
                      placeholder="Notes…"
                      style={{
                        width: '100%', padding: '6px 10px', borderRadius: 8, fontSize: 12,
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.7)', fontFamily: 'Dropline, sans-serif',
                      }}
                    />
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{
                gridColumn: '1 / -1', textAlign: 'center',
                padding: '64px 0', color: 'rgba(255,255,255,0.3)', fontSize: 14,
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
