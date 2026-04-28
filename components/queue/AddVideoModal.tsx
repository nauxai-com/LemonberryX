'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Channel } from '@/lib/supabase/types';

interface Props { channels: Channel[]; onClose: () => void; onSave: () => void; }

export default function AddVideoModal({ channels, onClose, onSave }: Props) {
  const [form, setForm] = useState({ title: '', channel_id: channels[0]?.id || '', source: 'Manual', status: 'idea', priority: 'mid' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await supabase.from('queue').insert({ ...form, day_number: null, ab_curiosity: null, ab_fear: null, ab_result: null, script_content: null, compliance_score: null, notes: null });
    onSave();
  };

  const field = (label: string, key: string, type: 'text' | 'select', opts?: string[]) => (
    <div>
      <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</label>
      {type === 'select' ? (
        <select className="w-full px-3 py-2 text-sm rounded-lg" value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}>
          {opts?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input className="w-full px-3 py-2 text-sm rounded-lg" value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="glass-card p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg">Add Video</h2>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.4)' }}>✕</button>
        </div>
        <div className="space-y-4">
          {field('Title', 'title', 'text')}
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>Channel</label>
            <select className="w-full px-3 py-2 text-sm rounded-lg" value={form.channel_id} onChange={e => setForm(p => ({ ...p, channel_id: e.target.value }))}>
              {channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {field('Source', 'source', 'select', ['AI Ask Studio', 'NotebookLM', 'Manual', 'Crawl4AI'])}
          {field('Status', 'status', 'select', ['idea', 'research', 'script', 'production', 'done'])}
          {field('Priority', 'priority', 'select', ['high', 'mid', 'low'])}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}>Cancel</button>
          <button onClick={save} disabled={saving} className="flex-1 py-2 rounded-lg text-sm font-semibold" style={{ background: 'linear-gradient(135deg,#7C3AED,#D946EF)', color: '#fff' }}>
            {saving ? 'Saving…' : 'Add Video'}
          </button>
        </div>
      </div>
    </div>
  );
}
