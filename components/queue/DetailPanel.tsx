'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Channel, QueueItem } from '@/lib/supabase/types';

interface Props { item: QueueItem; channels: Channel[]; onClose: () => void; onUpdate: () => void; }

export default function DetailPanel({ item, channels, onClose, onUpdate }: Props) {
  const [form, setForm] = useState({
    title: item.title,
    status: item.status,
    ab_curiosity: item.ab_curiosity || '',
    ab_fear: item.ab_fear || '',
    ab_result: item.ab_result || '',
    script_content: item.script_content || '',
    notes: item.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [checking, setChecking] = useState(false);

  const save = async () => {
    setSaving(true);
    await supabase.from('queue').update(form).eq('id', item.id);
    setSaving(false);
    onUpdate();
  };

  const generateScript = async () => {
    setGenerating(true);
    const res = await fetch('/api/script', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic: form.title, keyPoints: form.notes, type: 'script' }) });
    const data = await res.json();
    setForm(p => ({ ...p, script_content: data.script || '' }));
    setGenerating(false);
  };

  const checkCompliance = async () => {
    setChecking(true);
    const res = await fetch('/api/comply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ script: form.script_content, title: form.title }) });
    const data = await res.json();
    await supabase.from('queue').update({ compliance_score: data.score }).eq('id', item.id);
    setChecking(false);
    onUpdate();
  };

  return (
    <div
      className="flex flex-col h-full shrink-0 overflow-auto"
      style={{ width: 420, background: 'rgba(19,16,42,0.95)', backdropFilter: 'blur(20px)', borderLeft: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 className="text-base font-semibold" style={{ color: '#fff', fontFamily: 'Outfit' }}>Video Detail</h3>
        <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.4)', fontSize: 20 }}>✕</button>
      </div>

      <div className="flex flex-col gap-5 px-6 py-5 flex-1">
        {/* Title */}
        <div>
          <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Title</label>
          <input className="w-full px-3 py-2 text-sm rounded-lg" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
        </div>

        {/* Status */}
        <div>
          <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Status</label>
          <select className="w-full px-3 py-2 text-sm rounded-lg" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))}>
            {['idea','research','script','production','done'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* AB Variants */}
        <div>
          <div className="text-xs mb-2 font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>AB Test Variants</div>
          {[['Curiosity', 'ab_curiosity', '#06B6D4'], ['Fear', 'ab_fear', '#EF4444'], ['Result', 'ab_result', '#10B981']].map(([label, key, color]) => (
            <div key={key} className="mb-2">
              <label className="text-xs mb-1 block" style={{ color }}>{label}</label>
              <input className="w-full px-3 py-1.5 text-xs rounded-lg" value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key as string]: e.target.value }))} placeholder={`${label} title variant…`} />
            </div>
          ))}
        </div>

        {/* Script */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Script</label>
            {item.compliance_score !== null && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: item.compliance_score >= 7 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: item.compliance_score >= 7 ? '#10B981' : '#EF4444' }}>
                Compliance: {item.compliance_score}/10
              </span>
            )}
          </div>
          <textarea
            className="w-full px-3 py-2 text-xs rounded-lg flex-1"
            style={{ minHeight: 160, resize: 'vertical' }}
            value={form.script_content}
            onChange={e => setForm(p => ({ ...p, script_content: e.target.value }))}
            placeholder="Script content…"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Notes / Key Points</label>
          <textarea className="w-full px-3 py-2 text-xs rounded-lg" rows={3} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <button onClick={generateScript} disabled={generating} className="py-2 rounded-lg text-sm font-semibold transition-all" style={{ background: generating ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg,#7C3AED,#D946EF)', color: '#fff' }}>
            {generating ? '✨ Generating…' : '✨ Generate Script'}
          </button>
          <button onClick={checkCompliance} disabled={checking || !form.script_content} className="py-2 rounded-lg text-sm font-semibold" style={{ background: 'rgba(6,182,212,0.2)', border: '1px solid rgba(6,182,212,0.3)', color: '#06B6D4' }}>
            {checking ? '🛡️ Checking…' : '🛡️ Check Compliance'}
          </button>
          <button onClick={save} disabled={saving} className="py-2 rounded-lg text-sm font-semibold" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
