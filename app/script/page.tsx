'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import TopBar from '@/components/layout/TopBar';

// ── Hook Builder ──────────────────────────────────────────────
const HOOK_SLOTS = [
  { key: 'grab',    label: 'GRAB',    timing: '0-5s',   hint: 'Open with a shocking fact, paradox, or visual scene that demands attention.', color: '#EF4444' },
  { key: 'promise', label: 'PROMISE', timing: '5-15s',  hint: 'Tell them exactly what they will learn — make it feel unmissable.', color: '#F59E0B' },
  { key: 'stakes',  label: 'STAKES',  timing: '15-30s', hint: 'Why does this matter? Add urgency, scale, or emotional consequence.', color: '#7C3AED' },
];

// ── AB Title Builder ──────────────────────────────────────────
const AB_CARDS = [
  { key: 'curiosity', label: 'CURIOSITY', trigger: 'The [Thing] Nobody Can Explain', color: '#06B6D4', example: 'e.g. "The $500M Gallery No One Is Allowed to Enter"' },
  { key: 'fear',      label: 'FEAR',      trigger: 'The $X That Vanished',            color: '#EF4444', example: 'e.g. "The $850,000 Bitcoin That Disappeared Overnight"' },
  { key: 'result',    label: 'RESULT',    trigger: '2 Men Stole $X in Y Minutes',    color: '#10B981', example: 'e.g. "3 Men Robbed $500M in 81 Minutes"' },
];

// ── Pre-upload Checklist — 15 items across 3 categories ───────
// Originality: 5 items × 0.6 pts = 3 pts max
// Production:  5 items × 0.8 pts = 4 pts max
// Compliance:  5 items × 0.6 pts = 3 pts max
// Total possible: 10 pts. Pass at ≥7.
const CHECKLIST_CATS = [
  {
    category: 'ORIGINALITY', color: '#7C3AED', ptsEach: 0.6,
    items: [
      'Unique angle not found in any single source',
      'Original creator take or theory included',
      'Research from 3+ distinct sources synthesized',
      'Grimm Archives financial analysis added',
      'Hook opens with unexpected stat or question',
    ],
  },
  {
    category: 'PRODUCTION', color: '#D946EF', ptsEach: 0.8,
    items: [
      'Voiceover has tonal variation — not flat delivery',
      '60%+ motion video clips (not static only)',
      'Structure is different from last 3 videos',
      'No recycled Hunyuan/Whisk assets from past videos',
      'ElevenLabs stability set below 0.45',
    ],
  },
  {
    category: 'COMPLIANCE', color: '#06B6D4', ptsEach: 0.6,
    items: [
      'AI disclosure toggled ON in YouTube Studio',
      'Script human-reviewed and rewritten',
      'No real news event simulation',
      'No realistic AI faces of real named people',
      'Title and description match script content exactly',
    ],
  },
];

const TOTAL_ITEMS = CHECKLIST_CATS.reduce((a, c) => a + c.items.length, 0);

const BENCHMARKS = [
  { metric: 'Retention at 30s', target: '70%+',  color: '#10B981', note: 'Solid hook' },
  { metric: 'Retention at 30s', target: '80%+',  color: '#10B981', note: 'Exceptional' },
  { metric: 'AVD',              target: '70%+',  color: '#10B981', note: 'Viral zone — priority push' },
  { metric: 'AVD',              target: '50-60%',color: '#F59E0B', note: 'Solid' },
  { metric: 'First 5s interrupt', target: '+23%',color: '#10B981', note: 'Higher retention' },
  { metric: 'Open loops',       target: '+68%',  color: '#10B981', note: 'Completion rate' },
  { metric: 'Every 30s interrupt',target: '+43%',color: '#10B981', note: 'Completion rate' },
  { metric: '15%+ above avg',   target: '2.3x',  color: '#D946EF', note: 'Algorithm push' },
];

// Cue marker highlighting
const renderScript = (text: string) =>
  text.replace(
    /\[(VISUAL|SFX|CAMERA CHANGE|B-ROLL|GRAPHIC|SOUND EFFECT|UNEXPECTED STAT|PAUSE|BREATHE|INTENSE|CALM DOWN|PATTERN INTERRUPT)[^\]]*\]/g,
    m => `<mark style="background:rgba(245,158,11,0.22);color:#F59E0B;border-radius:3px;padding:0 3px">${m}</mark>`
  );

// SVG Ring Component
function ScoreRing({ score, pass }: { score: number; pass: boolean }) {
  const R = 38;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - score / 10);
  const ringColor = pass ? '#10B981' : score >= 5 ? '#F59E0B' : '#EF4444';

  return (
    <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
      <svg width={96} height={96} viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={48} cy={48} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={8} />
        <circle
          cx={48} cy={48} r={R} fill="none"
          stroke={ringColor}
          strokeWidth={8}
          strokeDasharray={C}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: 'ChargerExtrabold, Outfit', fontWeight: 900, fontSize: 20, color: ringColor, WebkitTextFillColor: ringColor, background: 'none', lineHeight: 1 }}>
          {score.toFixed(1)}
        </span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'Dropline, sans-serif' }}>/10</span>
      </div>
    </div>
  );
}

function ScriptPageInner() {
  const params = useSearchParams();

  // Script form
  const [topic, setTopic]         = useState(params?.get('topic') || '');
  const [keyPoints, setKeyPoints] = useState('');
  const [script, setScript]       = useState('');
  const [loading, setLoading]     = useState(false);

  // Hook Builder
  const [hooks, setHooks] = useState({ grab: '', promise: '', stakes: '' });

  // AB Title Builder
  const [abVariants, setAbVariants] = useState({ curiosity: '', fear: '', result: '' });
  const [abInputs, setAbInputs]     = useState({ curiosity: '', fear: '', result: '' });
  const [loadingAb, setLoadingAb]   = useState(false);

  // Checklist (15 items)
  const [checks, setChecks] = useState<boolean[]>(new Array(TOTAL_ITEMS).fill(false));

  // Load from localStorage
  useEffect(() => {
    try {
      const savedHooks  = localStorage.getItem('lbx:hooks');
      const savedChecks = localStorage.getItem('lbx:checklist-v2');
      const savedAb     = localStorage.getItem('lbx:ab-inputs');
      if (savedHooks)  setHooks(JSON.parse(savedHooks));
      if (savedChecks) { const p = JSON.parse(savedChecks); if (p.length === TOTAL_ITEMS) setChecks(p); }
      if (savedAb)     setAbInputs(JSON.parse(savedAb));
    } catch {}
  }, []);

  const saveHooks = (next: typeof hooks) => {
    setHooks(next);
    localStorage.setItem('lbx:hooks', JSON.stringify(next));
  };

  const saveChecks = (next: boolean[]) => {
    setChecks(next);
    localStorage.setItem('lbx:checklist-v2', JSON.stringify(next));
  };

  const saveAbInputs = (next: typeof abInputs) => {
    setAbInputs(next);
    localStorage.setItem('lbx:ab-inputs', JSON.stringify(next));
  };

  // Score calculation
  const score = CHECKLIST_CATS.flatMap((cat, ci) =>
    cat.items.map((_, ii) => checks[ci * 5 + ii] ? cat.ptsEach : 0)
  ).reduce((a, b) => a + b, 0);
  const pass = score >= 7;

  const generateScript = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res  = await fetch('/api/script', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic, keyPoints, type: 'script' }) });
      const data = await res.json();
      setScript(data.script || 'Error generating script.');
    } catch { setScript('Error generating script.'); }
    setLoading(false);
  };

  const generateAB = async () => {
    if (!topic.trim()) return;
    setLoadingAb(true);
    try {
      const res  = await fetch('/api/script', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic, keyPoints, type: 'ab' }) });
      const data = await res.json();
      if (data.variants) setAbVariants(data.variants);
    } catch {}
    setLoadingAb(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <TopBar title="Script Engine" subtitle="Retention-engineered scripts for Grimm Archives" />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ─── LEFT PANEL ─────────────────────────────────────── */}
        <div style={{ width: 500, display: 'flex', flexDirection: 'column', gap: 20, padding: '24px 24px 24px 0', overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

          {/* Generate Script */}
          <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 style={{ fontSize: 14, margin: 0 }}>Generate Script</h2>
            <div>
              <label style={{ fontSize: 11, display: 'block', marginBottom: 6, color: 'rgba(255,255,255,0.5)', fontFamily: 'Dropline, sans-serif' }}>Video topic / title</label>
              <input
                style={{ width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 8, fontFamily: 'Dropline, sans-serif' }}
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. The $500M Gardner Museum Heist…"
              />
            </div>
            <div>
              <label style={{ fontSize: 11, display: 'block', marginBottom: 6, color: 'rgba(255,255,255,0.5)', fontFamily: 'Dropline, sans-serif' }}>Key points to cover</label>
              <textarea
                style={{ width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 8, resize: 'vertical', fontFamily: 'Dropline, sans-serif' }}
                rows={4}
                value={keyPoints}
                onChange={e => setKeyPoints(e.target.value)}
                placeholder="Key facts, unique angle, Grimm Archives Take…"
              />
            </div>
            <button
              onClick={generateScript}
              disabled={loading || !topic.trim()}
              style={{
                padding: '10px 0', borderRadius: 12, fontSize: 13, fontWeight: 600,
                background: loading ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg,#7C3AED,#D946EF)',
                color: '#fff', border: 'none', cursor: loading || !topic.trim() ? 'not-allowed' : 'pointer',
                opacity: !topic.trim() ? 0.5 : 1, fontFamily: 'Dropline, sans-serif',
              }}
            >
              {loading ? '✨ Generating…' : '✨ Generate Full Retention Script'}
            </button>
          </div>

          {/* Hook Builder */}
          <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 14, margin: 0 }}>Hook Builder</h2>
            {HOOK_SLOTS.map(slot => (
              <div key={slot.key}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{
                    padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                    background: `${slot.color}22`, color: slot.color, border: `1px solid ${slot.color}44`,
                    fontFamily: 'Dropline, sans-serif', letterSpacing: '0.06em',
                  }}>{slot.label}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'Dropline, sans-serif' }}>{slot.timing}</span>
                </div>
                <textarea
                  style={{ width: '100%', padding: '8px 12px', fontSize: 12, borderRadius: 8, resize: 'none', fontFamily: 'Dropline, sans-serif', lineHeight: 1.55 }}
                  rows={3}
                  value={hooks[slot.key as keyof typeof hooks]}
                  onChange={e => saveHooks({ ...hooks, [slot.key]: e.target.value })}
                  placeholder={slot.hint}
                />
              </div>
            ))}
          </div>

          {/* AB Title Builder */}
          <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 14, margin: 0 }}>AB Title Builder</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {AB_CARDS.map(card => (
                <div key={card.key} style={{ background: `${card.color}0d`, border: `1px solid ${card.color}30`, borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                      background: `${card.color}22`, color: card.color, border: `1px solid ${card.color}44`,
                      fontFamily: 'Dropline, sans-serif', letterSpacing: '0.06em',
                    }}>{card.label}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'Dropline, sans-serif' }}>{card.trigger}</span>
                  </div>
                  <textarea
                    style={{ width: '100%', padding: '8px 12px', fontSize: 12, borderRadius: 8, resize: 'none', fontFamily: 'Dropline, sans-serif' }}
                    rows={2}
                    value={abInputs[card.key as keyof typeof abInputs]}
                    onChange={e => saveAbInputs({ ...abInputs, [card.key]: e.target.value })}
                    placeholder={card.example}
                  />
                  {abVariants[card.key as keyof typeof abVariants] && (
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', fontSize: 12, color: 'rgba(255,255,255,0.65)', fontFamily: 'Dropline, sans-serif' }}>
                      <span style={{ color: card.color, fontWeight: 600 }}>AI: </span>
                      {abVariants[card.key as keyof typeof abVariants]}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={generateAB}
              disabled={loadingAb || !topic.trim()}
              style={{
                padding: '9px 0', borderRadius: 12, fontSize: 13, fontWeight: 600,
                background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)',
                color: '#06B6D4', cursor: loadingAb || !topic.trim() ? 'not-allowed' : 'pointer',
                opacity: !topic.trim() ? 0.5 : 1, fontFamily: 'Dropline, sans-serif',
              }}
            >
              {loadingAb ? 'Generating…' : '⚡ Generate AB Variants'}
            </button>
          </div>
        </div>

        {/* ─── RIGHT PANEL ────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, padding: '24px 0 24px 24px', overflowY: 'auto' }}>

          {/* Pre-upload Checklist + SVG Ring */}
          <div className="glass-card" style={{ padding: 22 }}>
            {/* Ring + score header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
              <ScoreRing score={score} pass={pass} />
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 14, margin: '0 0 6px' }}>Pre-Upload Checklist</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span className={`badge ${pass ? 'badge-live' : 'badge-high'}`} style={{ fontSize: 12 }}>
                    {pass ? '✅ PASS' : score >= 5 ? '⚠️ ALMOST' : '❌ NEEDS WORK'}
                  </span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'Dropline, sans-serif' }}>
                    {checks.filter(Boolean).length}/{TOTAL_ITEMS} checked · pass at 7/10
                  </span>
                  <button
                    onClick={() => saveChecks(new Array(TOTAL_ITEMS).fill(false))}
                    style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Dropline, sans-serif' }}
                  >
                    Reset for next video
                  </button>
                </div>
              </div>
            </div>

            {/* Score bar */}
            <div className="rpm-bar" style={{ height: 6, marginBottom: 20 }}>
              <div className="rpm-fill" style={{ width: `${(score / 10) * 100}%`, background: pass ? '#10B981' : score >= 5 ? 'linear-gradient(90deg,#F59E0B,#D946EF)' : 'linear-gradient(90deg,#EF4444,#F59E0B)' }} />
            </div>

            {/* Categorized items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {CHECKLIST_CATS.map((cat, ci) => (
                <div key={cat.category}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color, boxShadow: `0 0 6px ${cat.color}` }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: cat.color, fontFamily: 'Dropline, sans-serif', letterSpacing: '0.06em' }}>{cat.category}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'Dropline, sans-serif' }}>({(cat.ptsEach * cat.items.length).toFixed(0)} pts max)</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {cat.items.map((item, ii) => {
                      const idx = ci * 5 + ii;
                      return (
                        <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={checks[idx]}
                            onChange={() => { const n = [...checks]; n[idx] = !n[idx]; saveChecks(n); }}
                            style={{ marginTop: 2, accentColor: cat.color, flexShrink: 0 }}
                          />
                          <span style={{ fontSize: 12, color: checks[idx] ? cat.color : 'rgba(255,255,255,0.6)', fontFamily: 'Dropline, sans-serif', lineHeight: 1.5 }}>
                            {item}
                            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginLeft: 6 }}>+{cat.ptsEach}pt</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Retention Benchmarks */}
          <div className="glass-card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 14, margin: '0 0 14px' }}>Retention Benchmarks</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {BENCHMARKS.map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: b.color, fontFamily: 'ChargerExtrabold, Outfit', WebkitTextFillColor: b.color, background: 'none', flexShrink: 0, minWidth: 48 }}>{b.target}</span>
                  <div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: 'Dropline, sans-serif' }}>{b.metric}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'Dropline, sans-serif' }}>{b.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Script Output */}
          {script && (
            <div className="glass-card" style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h2 style={{ fontSize: 14, margin: 0 }}>Generated Script</h2>
                <button
                  onClick={() => navigator.clipboard.writeText(script)}
                  style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Dropline, sans-serif' }}
                >
                  Copy
                </button>
              </div>
              <div
                style={{ fontSize: 12, lineHeight: 1.7, overflowY: 'auto', flex: 1, padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.8)', whiteSpace: 'pre-wrap', maxHeight: 520, fontFamily: 'Dropline, sans-serif' }}
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
