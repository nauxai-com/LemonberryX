'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Channel } from '@/lib/supabase/types';

const STAGES = [
  { n: 'S0',  label: 'Compliance Brief Check',        tool: 'YT Compliance Shield — confirm angle original',         day: 'Mon' },
  { n: 'S1',  label: 'Research & Ideation',            tool: 'Crawl4AI + NotebookLM-py + AI Ask Studio',             day: 'Mon' },
  { n: 'S2',  label: 'Script (Retention-Engineered)',  tool: 'AgriciDaniel/claude-youtube + 3 AB variants',          day: 'Tue' },
  { n: 'S3',  label: 'Title Alignment Check',          tool: 'Claude — verify script matches metadata',              day: 'Tue' },
  { n: 'S4',  label: 'AB Test 3 Variants',             tool: 'Curiosity / Fear / Result triggers',                   day: 'Tue' },
  { n: 'S5',  label: 'Visuals',                        tool: 'Whisk images + Hunyuan clips (min 60% motion)',        day: 'Wed' },
  { n: 'S6',  label: 'Voiceover',                      tool: 'ElevenLabs (Stab:0.40, Style:0.65) / Kokoro TTS',     day: 'Thu' },
  { n: 'S7',  label: 'Auto-Edit + Assembly',           tool: 'auto-editor silence removal + CapCut / OpenCut',       day: 'Sat' },
  { n: 'S8',  label: 'Thumbnail (3 variants)',         tool: 'Canva — Curiosity / Fear / Result',                    day: 'Sat' },
  { n: 'S8.5',label: 'Compliance Scorecard',           tool: 'Must score 7/10+ before upload',                       day: 'Sat', highlight: true },
  { n: 'S9',  label: 'Upload + Shorts Factory',        tool: 'YouTube Studio + short-video-maker · AI disclosure ON', day: 'Sat', lemon: true },
];

const SCHEDULE = [
  { day: 'Monday',    task: 'Research — Crawl4AI auto-scrape + NotebookLM pull',                             time: '20 min' },
  { day: 'Tuesday',   task: 'Script (retention framework) + 3 AB title variants',                            time: '45 min' },
  { day: 'Wednesday', task: 'Whisk images + Hunyuan clips batch',                                            time: '45 min' },
  { day: 'Thursday',  task: 'Voiceover + title alignment check',                                             time: '25 min' },
  { day: 'Saturday',  task: 'auto-editor → CapCut assembly → 3 thumbnails → upload + Shorts',               time: '90 min' },
];

function PipelineSelect({ saved, onChange }: { saved: string; onChange: (v: string) => void }) {
  return (
    <select
      value={saved}
      onChange={e => onChange(e.target.value)}
      style={{
        background: 'transparent', border: '1px solid var(--border)',
        borderRadius: 6, color: 'var(--text)',
        fontFamily: 'Dropline, sans-serif', fontSize: 10,
        padding: '4px 8px', cursor: 'pointer', outline: 'none', width: 80,
      }}
    >
      <option style={{ background: 'var(--panel)' }}>Pending</option>
      <option style={{ background: 'var(--panel)' }}>Done</option>
      <option style={{ background: 'var(--panel)' }}>Skip</option>
    </select>
  );
}

export default function PipelinePage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [pipeState, setPipeState] = useState<string[]>(Array(STAGES.length).fill('Pending'));

  useEffect(() => {
    supabase.from('channels').select('*').then(({ data }) => setChannels(data || []));
    try {
      const saved = localStorage.getItem('lbx:pipeline');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setPipeState(parsed);
      }
    } catch {}
  }, []);

  const updateStage = (i: number, val: string) => {
    const next = [...pipeState];
    next[i] = val;
    setPipeState(next);
    localStorage.setItem('lbx:pipeline', JSON.stringify(next));
  };

  const done = pipeState.filter(s => s === 'Done').length;
  const pct  = Math.round((done / STAGES.length) * 100);

  return (
    <div className="fade-in">
      {/* Top info bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <p className="section-title" style={{ margin: 0 }}>Universal Production Pipeline — {STAGES.length} Stages</p>
        <div style={{ fontFamily: 'Dropline, sans-serif', fontSize: 11, color: 'var(--text-muted)' }}>
          Target:{' '}
          <span style={{ color: 'var(--lemon)' }}>~90 min/video</span>
          {' · '}
          <span style={{ color: 'var(--mint)' }}>3.5–4 hrs/wk</span>
          {' · '}
          <span style={{ color: 'var(--violet-light)' }}>{done}/{STAGES.length} done ({pct}%)</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="rpm-bar" style={{ height: 5, marginBottom: 20 }}>
        <div className="rpm-fill" style={{ width: `${pct}%` }} />
      </div>

      {/* Pipeline rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        {/* Header row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '48px 200px 1fr 80px 100px',
          padding: '0 0 6px', fontFamily: 'Dropline, sans-serif',
          fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px',
        }}>
          <div style={{ paddingLeft: 14 }}>#</div>
          <div style={{ paddingLeft: 16 }}>Stage</div>
          <div style={{ paddingLeft: 16 }}>Tools</div>
          <div style={{ paddingLeft: 16, textAlign: 'center' }}>Day</div>
          <div style={{ paddingLeft: 16, textAlign: 'center' }}>Status</div>
        </div>

        {STAGES.map((stage, i) => (
          <div key={i} className="pipeline-row">
            {/* Number */}
            <div style={{
              height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: stage.highlight ? 'rgba(255,59,140,0.1)' : stage.lemon ? 'rgba(232,244,0,0.08)' : 'rgba(112,72,248,0.10)',
              borderRight: '1px solid var(--border)',
              fontFamily: 'Dropline, sans-serif', fontSize: 11, fontWeight: 700,
              color: stage.highlight ? 'var(--berry)' : stage.lemon ? 'var(--lemon)' : 'var(--violet-light)',
              letterSpacing: '0.05em',
            }}>
              {stage.n}
            </div>

            {/* Stage name */}
            <div style={{
              padding: '0 16px',
              fontFamily: 'ChargerExtrabold, Outfit, sans-serif',
              fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em',
              color: stage.highlight ? 'var(--berry)' : stage.lemon ? 'var(--lemon)' : 'var(--text)',
              WebkitTextFillColor: stage.highlight ? 'var(--berry)' : stage.lemon ? 'var(--lemon)' : 'var(--text)',
              background: 'none',
            }}>
              {stage.label}
            </div>

            {/* Tool */}
            <div style={{
              padding: '0 16px', fontSize: 12, color: 'var(--text-muted)',
              borderLeft: '1px solid var(--border)', fontFamily: 'Dropline, sans-serif',
            }}>
              {stage.tool}
            </div>

            {/* Day */}
            <div style={{
              padding: '0 16px', fontFamily: 'Dropline, sans-serif', fontSize: 11,
              color: stage.highlight ? 'var(--berry)' : stage.lemon ? 'var(--lemon)' : 'var(--lemon)',
              borderLeft: '1px solid var(--border)', textAlign: 'center', letterSpacing: '0.05em',
            }}>
              {stage.day}
            </div>

            {/* Status */}
            <div style={{
              padding: '0 16px', borderLeft: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', height: 52,
            }}>
              <PipelineSelect saved={pipeState[i]} onChange={v => updateStage(i, v)} />
            </div>
          </div>
        ))}
      </div>

      {/* Weekly schedule */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24 }}>
        <p className="section-title">Weekly Schedule</p>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Day', 'Task', 'Time'].map(h => (
                <th key={h} style={{
                  fontFamily: 'Dropline, sans-serif', fontSize: 10, color: 'var(--text-dim)',
                  textTransform: 'uppercase', letterSpacing: '1px',
                  padding: '10px 16px', textAlign: 'left',
                  borderBottom: '1px solid var(--border)',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SCHEDULE.map(row => (
              <tr key={row.day} style={{ borderBottom: '1px solid rgba(140,100,255,0.08)' }}>
                <td style={{
                  padding: '12px 16px', minWidth: 110,
                  fontFamily: 'ChargerExtrabold, Outfit, sans-serif',
                  fontWeight: 700, fontSize: 12, textTransform: 'uppercase',
                  color: 'var(--lemon)', WebkitTextFillColor: 'var(--lemon)', background: 'none',
                }}>
                  {row.day}
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)', fontFamily: 'Dropline, sans-serif' }}>
                  {row.task}
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'Dropline, sans-serif', fontSize: 11, color: 'var(--violet-light)', whiteSpace: 'nowrap' }}>
                  {row.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
