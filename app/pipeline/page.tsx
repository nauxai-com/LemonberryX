'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Channel } from '@/lib/supabase/types';
import TopBar from '@/components/layout/TopBar';

const STAGES = [
  { n: 0,   label: 'Compliance Brief Check',     desc: 'Before scripting — confirm angle is original + unique', tool: 'YT Compliance Shield' },
  { n: 1,   label: 'Research (3+ sources)',        desc: 'Crawl4AI + NotebookLM-py + AI Ask Studio',             tool: 'Crawl4AI · NotebookLM' },
  { n: 2,   label: 'Script + Creator Take',        desc: 'claude-youtube framework + SSML cues + unique angle',  tool: 'claude-youtube' },
  { n: 3,   label: 'Title Alignment Check',        desc: 'Verify script matches metadata exactly',               tool: 'Claude' },
  { n: 4,   label: 'AB Test 3 Variants',           desc: 'Curiosity / Fear / Result triggers',                   tool: 'Script Engine' },
  { n: 5,   label: 'Visuals (60%+ motion)',        desc: 'Whisk images + Hunyuan clips — min 4 motion clips',    tool: 'Whisk · Hunyuan' },
  { n: 6,   label: 'Voiceover (with direction)',   desc: 'ElevenLabs stability <0.45 + tonal variation cues',    tool: 'ElevenLabs' },
  { n: 7,   label: 'Auto-Edit + Assembly',         desc: 'auto-editor silence removal + CapCut',                 tool: 'auto-editor · CapCut' },
  { n: 8,   label: 'Thumbnail (3 variants)',        desc: 'Canva — rotate style every 4th video',                 tool: 'Canva' },
  { n: 8.5, label: '🛡️ Compliance Scorecard',     desc: 'Must score 7/10+ or fix and re-check',                 tool: 'Compliance page' },
  { n: 9,   label: 'Upload',                       desc: 'AI disclosure ON — YouTube Studio — schedule',         tool: 'YouTube Studio' },
  { n: 10,  label: 'Shorts Factory',               desc: 'short-video-maker + AI-Shorts-Generator — 3 Shorts',   tool: 'short-video-maker' },
];

export default function PipelinePage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selected, setSelected] = useState<Channel | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('channels').select('*').then(({ data }) => {
      setChannels(data || []);
      setSelected(data?.[0] || null);
    });
  }, []);

  const setStage = async (n: number) => {
    if (!selected) return;
    setSaving(true);
    const stageInt = Math.floor(n);
    await supabase.from('channels').update({ pipeline_stage: stageInt }).eq('id', selected.id);
    setSelected(p => p ? { ...p, pipeline_stage: stageInt } : p);
    setChannels(prev => prev.map(c => c.id === selected.id ? { ...c, pipeline_stage: stageInt } : c));
    setSaving(false);
  };

  const current = selected?.pipeline_stage ?? 0;
  const completed = STAGES.filter(s => Math.floor(s.n) <= current).length;
  const pct = Math.round((completed / STAGES.length) * 100);

  return (
    <div className="flex flex-col" style={{ minHeight: '100%' }}>
      <TopBar title="Production Pipeline" subtitle="11-stage content workflow" />

      {/* Channel tabs */}
      <div className="px-8 py-3 flex gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {channels.map(c => (
          <button
            key={c.id}
            onClick={() => setSelected(c)}
            className="px-4 py-1.5 rounded-full text-sm transition-all"
            style={{
              background: selected?.id === c.id ? 'rgba(124,58,237,0.35)' : 'rgba(255,255,255,0.06)',
              border: selected?.id === c.id ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,255,255,0.1)',
              color: selected?.id === c.id ? '#fff' : 'rgba(255,255,255,0.55)',
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="px-8 py-4 flex items-center gap-6 flex-wrap" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {[
          { label: 'Progress', value: `${pct}%` },
          { label: 'Est. time/video', value: '~90 min' },
          { label: 'Weekly total', value: '3.5 hrs' },
          { label: 'Stages left', value: `${STAGES.length - completed}` },
        ].map(({ label, value }) => (
          <div key={label} className="glass-card px-4 py-2 text-center" style={{ minWidth: 100 }}>
            <div className="text-sm font-bold" style={{ color: '#D946EF', fontFamily: 'Outfit' }}>{value}</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</div>
          </div>
        ))}
        {/* Progress bar */}
        <div className="flex-1 min-w-32">
          <div className="rpm-bar" style={{ height: 6 }}>
            <div className="rpm-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Stages */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="space-y-2 max-w-2xl">
          {STAGES.map((stage, i) => {
            const isDone    = Math.floor(stage.n) < current;
            const isCurrent = Math.floor(stage.n) === current;
            const isPending = Math.floor(stage.n) > current;
            return (
              <button
                key={i}
                onClick={() => setStage(stage.n)}
                disabled={saving}
                className="w-full flex items-start gap-4 px-4 py-3.5 rounded-xl text-left transition-all"
                style={{
                  background: isCurrent ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.03)',
                  border: isCurrent ? '1px solid rgba(124,58,237,0.35)' : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: isCurrent ? '0 0 16px rgba(124,58,237,0.15)' : 'none',
                }}
              >
                {/* Dot */}
                <div
                  className={`stage-dot mt-1 shrink-0 ${isCurrent ? 'completing' : ''}`}
                  style={{
                    background: isDone ? '#10B981' : isCurrent ? '#D946EF' : 'rgba(255,255,255,0.2)',
                    boxShadow: isCurrent ? '0 0 8px rgba(217,70,239,0.8)' : 'none',
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold" style={{ color: isDone ? '#10B981' : isCurrent ? '#fff' : 'rgba(255,255,255,0.5)' }}>
                      Stage {stage.n} — {stage.label}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
                      {stage.tool}
                    </span>
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{stage.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
