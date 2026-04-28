'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import TopBar from '@/components/layout/TopBar';

const CHECKLIST = [
  'No "Hey guys welcome back" opener',
  'Hook: Grab (0-5s) + Promise (5-15s) + Stakes (15-30s)',
  'Script content matches title/description exactly',
  'Pattern interrupt every 60-90 seconds',
  'Soft CTA at ~1 min mark',
  'Open loop mid-video',
  'Retention re-hook at ~60% mark',
  'Hard CTA in outro — energy to last second',
  'AB test: 3 title variants + 3 thumbnails live',
];

const BENCHMARKS = [
  { metric: 'Retention at 30s', target: '70%+', color: '#10B981', note: 'Solid hook' },
  { metric: 'Retention at 30s', target: '80%+', color: '#10B981', note: 'Exceptional' },
  { metric: 'AVD', target: '70%+', color: '#10B981', note: 'Viral zone — priority push' },
  { metric: 'AVD', target: '50-60%', color: '#F59E0B', note: 'Solid' },
  { metric: 'First 5s interrupt', target: '+23%', color: '#10B981', note: 'Higher retention' },
  { metric: 'Open loops', target: '+68%', color: '#10B981', note: 'Completion rate' },
  { metric: 'Every 30s interrupt', target: '+43%', color: '#10B981', note: 'Completion rate' },
  { metric: '15%+ above avg', target: '2.3x', color: '#D946EF', note: 'Algorithm push' },
];

function ScriptPageInner() {
  const params = useSearchParams();
  const [topic, setTopic] = useState(params?.get('topic') || '');
  const [keyPoints, setKeyPoints] = useState('');
  const [script, setScript] = useState('');
  const [abVariants, setAbVariants] = useState({ curiosity: '', fear: '', result: '' });
  const [abInputs, setAbInputs] = useState({ curiosity: '', fear: '', result: '' });
  const [loading, setLoading] = useState(false);
  const [loadingAb, setLoadingAb] = useState(false);
  const [checks, setChecks] = useState<boolean[]>(new Array(CHECKLIST.length).fill(false));

  useEffect(() => {
    const saved = localStorage.getItem('lbx:checklist');
    if (saved) setChecks(JSON.parse(saved));
  }, []);

  const saveChecks = (next: boolean[]) => {
    setChecks(next);
    localStorage.setItem('lbx:checklist', JSON.stringify(next));
  };

  const generateScript = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    const res = await fetch('/api/script', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic, keyPoints, type: 'script' }) });
    const data = await res.json();
    setScript(data.script || 'Error generating script.');
    setLoading(false);
  };

  const generateAB = async () => {
    if (!topic.trim()) return;
    setLoadingAb(true);
    const res = await fetch('/api/script', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic, keyPoints, type: 'ab' }) });
    const data = await res.json();
    if (data.variants) setAbVariants(data.variants);
    setLoadingAb(false);
  };

  const checkedCount = checks.filter(Boolean).length;

  // Highlight cue markers in script
  const renderScript = (text: string) => {
    return text.replace(/\[(VISUAL|SFX|CAMERA CHANGE|B-ROLL|GRAPHIC|SOUND EFFECT|UNEXPECTED STAT|PAUSE|BREATHE|INTENSE|CALM DOWN|PATTERN INTERRUPT)[^\]]*\]/g,
      (m) => `<mark style="background:rgba(245,158,11,0.25);color:#F59E0B;border-radius:3px;padding:0 2px">${m}</mark>`
    );
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Script Engine" subtitle="Retention-engineered scripts for Grimm Archives" />
      <div className="flex flex-1 overflow-hidden">
        {/* Left */}
        <div className="flex flex-col gap-5 p-8 overflow-auto" style={{ width: 500, borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Form */}
          <div className="glass-card p-5 flex flex-col gap-4">
            <h2 className="text-base">Generate Script</h2>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Video topic / title</label>
              <input className="w-full px-3 py-2 text-sm rounded-lg" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. The $500M Gardner Museum Heist…" />
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Key points to cover</label>
              <textarea className="w-full px-3 py-2 text-sm rounded-lg" rows={4} value={keyPoints} onChange={e => setKeyPoints(e.target.value)} placeholder="Key facts, unique angle, Grimm Archives Take…" />
            </div>
            <button
              onClick={generateScript}
              disabled={loading || !topic.trim()}
              className="py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: loading ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg,#7C3AED,#D946EF)', color: '#fff', opacity: !topic.trim() ? 0.5 : 1 }}
            >
              {loading ? '✨ Generating…' : '✨ Generate Full Retention Script'}
            </button>
          </div>

          {/* AB Panel */}
          <div className="glass-card p-5 flex flex-col gap-4">
            <h2 className="text-base">AB Test Variants</h2>
            <div className="grid grid-cols-3 gap-3">
              {[['Curiosity', 'curiosity', '#06B6D4'], ['Fear', 'fear', '#EF4444'], ['Result', 'result', '#10B981']].map(([label, key, color]) => (
                <div key={key}>
                  <span className="badge mb-2 inline-block" style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>{label}</span>
                  <input
                    className="w-full px-2 py-1.5 text-xs rounded-lg"
                    value={abVariants[key as keyof typeof abVariants] || abInputs[key as keyof typeof abInputs]}
                    onChange={e => setAbInputs(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={`${label} title…`}
                  />
                  {abVariants[key as keyof typeof abVariants] && (
                    <div className="text-xs mt-1 p-1.5 rounded" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)' }}>
                      {abVariants[key as keyof typeof abVariants]}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button onClick={generateAB} disabled={loadingAb || !topic.trim()} className="py-2 rounded-xl text-sm font-semibold" style={{ background: 'rgba(6,182,212,0.2)', border: '1px solid rgba(6,182,212,0.3)', color: '#06B6D4' }}>
              {loadingAb ? 'Generating…' : '⚡ Generate AB Variants'}
            </button>
          </div>

          {/* Checklist */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base">Pre-Upload Checklist</h2>
              <span className="text-xs" style={{ color: '#10B981' }}>{checkedCount}/{CHECKLIST.length} checked</span>
            </div>
            <div className="space-y-2">
              {CHECKLIST.map((item, i) => (
                <label key={i} className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={checks[i]} onChange={() => { const n = [...checks]; n[i] = !n[i]; saveChecks(n); }} className="mt-0.5 accent-purple-500" />
                  <span className="text-xs" style={{ color: checks[i] ? '#10B981' : 'rgba(255,255,255,0.6)' }}>{item}</span>
                </label>
              ))}
            </div>
            <button onClick={() => saveChecks(new Array(CHECKLIST.length).fill(false))} className="mt-3 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Reset for next video
            </button>
          </div>
        </div>

        {/* Right: benchmarks + output */}
        <div className="flex flex-col gap-5 p-8 flex-1 overflow-auto">
          {/* Benchmarks */}
          <div className="glass-card p-5">
            <h2 className="text-base mb-3">Retention Benchmarks</h2>
            <div className="grid grid-cols-2 gap-2">
              {BENCHMARKS.map((b, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span className="text-sm font-bold shrink-0" style={{ color: b.color, fontFamily: 'Outfit', minWidth: 44 }}>{b.target}</span>
                  <div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{b.metric}</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{b.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Script output */}
          {script && (
            <div className="glass-card p-5 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base">Generated Script</h2>
                <div className="flex gap-2">
                  <button onClick={() => navigator.clipboard.writeText(script)} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}>Copy</button>
                </div>
              </div>
              <div
                className="text-xs leading-6 overflow-auto flex-1 p-3 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.8)', whiteSpace: 'pre-wrap', maxHeight: 500 }}
                dangerouslySetInnerHTML={{ __html: renderScript(script) }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ScriptPage() {
  return <Suspense><ScriptPageInner /></Suspense>;
}
