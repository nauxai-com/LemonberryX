'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import type { Channel, ChannelStatus } from '@/lib/supabase/types';

const statusCycle: ChannelStatus[] = ['live', 'repositioning', 'paused'];

interface Props { channel: Channel; index: number; }

export default function ChannelCard({ channel, index }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [ch, setCh] = useState(channel);
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(channel.note || '');

  useEffect(() => {
    let VanillaTilt: any;
    import('vanilla-tilt').then((m) => {
      VanillaTilt = m.default;
      if (cardRef.current) VanillaTilt.init(cardRef.current, { max: 8, speed: 400, glare: true, 'max-glare': 0.15 });
    });
    return () => { if (cardRef.current && (cardRef.current as any).vanillaTilt) (cardRef.current as any).vanillaTilt.destroy(); };
  }, []);

  const cycleStatus = async () => {
    const next = statusCycle[(statusCycle.indexOf(ch.status) + 1) % statusCycle.length];
    await supabase.from('channels').update({ status: next }).eq('id', ch.id);
    setCh(p => ({ ...p, status: next }));
  };

  const saveNote = async () => {
    await supabase.from('channels').update({ note }).eq('id', ch.id);
    setCh(p => ({ ...p, note }));
    setEditing(false);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 60, rotateX: -15 },
    visible: { opacity: 1, y: 0, rotateX: 0, transition: { delay: index * 0.1, duration: 0.6, ease: 'easeOut' as const } },
  };

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" style={{ perspective: 1000 }}>
      <div
        ref={cardRef}
        className="glass-card p-5 flex flex-col gap-4 cursor-default"
        style={{ minHeight: 260 }}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 16, color: '#fff' }}>{ch.name}</div>
            <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)', maxWidth: 200 }}>{ch.niche}</div>
          </div>
          <button onClick={cycleStatus} className={`badge badge-${ch.status} cursor-pointer`}>
            {ch.status === 'live' ? '● Live' : ch.status === 'repositioning' ? '⟳ Repositioning' : '⏸ Paused'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'RPM Target', value: ch.rpm_target || '—' },
            { label: 'Audience',   value: ch.audience },
            { label: 'CPM Tier',   value: ch.cpm_tier || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</div>
              <div className="text-sm font-semibold mt-0.5" style={{ color: '#fff' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* RPM Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <span>RPM Progress</span><span>{ch.rpm_pct}%</span>
          </div>
          <div className="rpm-bar"><div className="rpm-fill" style={{ width: `${ch.rpm_pct}%` }} /></div>
        </div>

        {/* Note */}
        <div style={{ flex: 1 }}>
          {editing ? (
            <div className="flex gap-2">
              <input
                className="flex-1 px-2 py-1 text-xs rounded"
                value={note}
                onChange={e => setNote(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveNote()}
                autoFocus
              />
              <button onClick={saveNote} className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(124,58,237,0.4)', color: '#fff' }}>Save</button>
            </div>
          ) : (
            <div
              className="text-xs cursor-text rounded p-1.5"
              style={{ color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.03)', minHeight: 28 }}
              onClick={() => setEditing(true)}
            >
              {ch.note || <span style={{ color: 'rgba(255,255,255,0.2)' }}>Click to add note…</span>}
            </div>
          )}
        </div>

        {/* Pipeline stage */}
        <div className="flex items-center justify-between text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          <span>Pipeline stage</span>
          <span style={{ color: '#7C3AED', fontWeight: 600 }}>{ch.pipeline_stage}/11</span>
        </div>
      </div>
    </motion.div>
  );
}
