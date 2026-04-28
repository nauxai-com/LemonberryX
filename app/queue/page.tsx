'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Channel, QueueItem } from '@/lib/supabase/types';
import TopBar from '@/components/layout/TopBar';
import QueueItemRow from '@/components/queue/QueueItem';
import AddVideoModal from '@/components/queue/AddVideoModal';
import DetailPanel from '@/components/queue/DetailPanel';

export default function QueuePage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<QueueItem | null>(null);
  const [loading, setLoading] = useState(true);

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

  const filtered = items.filter(i => {
    const matchChannel = filter === 'all' || i.channels?.name === filter;
    const matchSearch = !search || i.title.toLowerCase().includes(search.toLowerCase());
    return matchChannel && matchSearch;
  });

  const scriptReady = items.filter(i => i.status === 'script').length;
  const researched  = items.filter(i => i.status === 'research').length;
  const ideas       = items.filter(i => i.status === 'idea').length;

  return (
    <div className="flex h-full">
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <TopBar title="Content Queue" subtitle={`${items.length} videos`} />

        {/* Filters + Search */}
        <div className="px-8 py-4 flex flex-wrap items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex gap-2 flex-wrap">
            {['all', ...channels.map(c => c.name)].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1 rounded-full text-xs transition-all"
                style={{
                  background: filter === f ? 'rgba(124,58,237,0.35)' : 'rgba(255,255,255,0.06)',
                  border: filter === f ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  color: filter === f ? '#fff' : 'rgba(255,255,255,0.55)',
                }}
              >
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-2">
            <span className="badge badge-script">{scriptReady} Script ready</span>
            <span className="badge badge-research">{researched} Researched</span>
            <span className="badge badge-idea">{ideas} Ideas</span>
          </div>
          <input
            className="ml-auto px-3 py-1.5 text-sm rounded-lg w-48"
            placeholder="Search titles…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#D946EF)', color: '#fff' }}
          >
            + Add Video
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-auto px-8 py-4">
          {loading ? (
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => <div key={i} className="glass-card h-12 animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-1.5">
              {filtered.map(item => (
                <QueueItemRow
                  key={item.id}
                  item={item}
                  onSelect={() => setSelected(item)}
                  onDelete={async () => { await supabase.from('queue').delete().eq('id', item.id); load(); }}
                  onUpdate={() => load()}
                />
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-16" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  No videos match this filter.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <DetailPanel
          item={selected}
          channels={channels}
          onClose={() => setSelected(null)}
          onUpdate={() => load()}
        />
      )}

      {showAdd && <AddVideoModal channels={channels} onClose={() => setShowAdd(false)} onSave={() => { setShowAdd(false); load(); }} />}
    </div>
  );
}
