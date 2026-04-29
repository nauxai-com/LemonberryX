'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const HOOK_SLOTS = [
  { key: 'grab',    label: 'GRAB',    timing: '0–5s',   color: '#FF4444',       hint: 'Bold claim or unexpected moment — the single most important line...' },
  { key: 'promise', label: 'PROMISE', timing: '5–15s',  color: 'var(--lemon)',  hint: 'Exact outcome viewer gets from watching this video...' },
  { key: 'stakes',  label: 'STAKES',  timing: '15–30s', color: 'var(--violet)', hint: 'Why it matters — what they lose by leaving now...' },
];

const AB_CARDS = [
  { key: 'curiosity', label: 'CURIOSITY TRIGGER', color: 'var(--violet-light)', placeholder: '"The Heist Nobody Can Explain"\nUnknown / secret / unsolved...' },
  { key: 'fear',      label: 'FEAR / LOSS TRIGGER',color: 'var(--berry)',        placeholder: '"The $500M That Vanished Before Anyone Noticed"\nGone / destroyed / stolen / too late...' },
  { key: 'result',    label: 'RESULT / NUMBER',    color: 'var(--lemon)',        placeholder: '"2 Men Stole $500M in 81 Minutes"\nSpecific $ / time / count...' },
];

const CHECKLIST_CATS = [
  { category: 'ORIGINALITY', color: 'var(--violet-light)', ptsEach: 0.6, items: [
    'Unique angle not found in any single source',
    'Original creator take or theory included',
    'Research from 3+ distinct sources synthesized',
    'Grimm Archives financial analysis added',
    'Hook opens with unexpected stat or question',
  ]},
  { category: 'PRODUCTION',  color: 'var(--berry)', ptsEach: 0.8, items: [
    'Voiceover has tonal variation — not flat delivery',
    '60%+ motion video clips (not static only)',
    'Structure is different from last 3 videos',
    'No recycled Hunyuan/Whisk assets from past videos',
    'ElevenLabs stability set below 0.45',
  ]},
  { category: 'COMPLIANCE',  color: 'var(--mint)', ptsEach: 0.6, items: [
    'AI disclosure toggled ON in YouTube Studio',
    'Script human-reviewed and rewritten',
    'No real news event simulation',
    'No realistic AI faces of real named people',
    'Title and description match script content exactly',
  ]},
];

const METRICS = [
  { val: '70%+',  color: 'var(--lemon)',        label: 'Retention @30s' },
  { val: '80%+',  color: 'var(--mint)',          label: 'Exceptional @30s' },
  { val: '70%+',  color: 'var(--berry)',         label: 'AVD Viral Zone' },
  { val: '+23%',  color: 'var(--violet-light)',  label: 'First 5s Interrupt' },
  { val: '+68%',  color: 'var(--lemon)',         label: 'Open Loop Boost' },
];

const TOTAL_ITEMS = 15;

const renderScript = (text: string) =>
  text.replace(/\[(VISUAL|SFX|CAMERA CHANGE|B-ROLL|GRAPHIC|SOUND EFFECT|UNEXPECTED STAT|PAUSE|BREATHE|INTENSE|CALM DOWN|PATTERN INTERRUPT)[^\]]*\]/g,
    m => `<mark style="background:rgba(232,244,0,0.18);color:var(--lemon);border-radius:3px;padding:0 3px">${m}</mark>`
  );

function ScoreRing({ score, pass }: { score: number; pass: boolean }) {
  const R = 38, C = 2 * Math.PI * R;
  const offset = C * (1 - score / 10);
  const color = pass ? 'var(--mint)' : score >= 5 ? 'var(--lemon)' : 'var(--berry)';
  return (
    <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
      <svg width={96} height={96} viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={48} cy={48} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={8} />
        <circle cx={48} cy={48} r={R} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={C} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'ChargerExtrabold, Outfit', fontWeight: 900, fontSize: 20, color, WebkitTextFillColor: color, background: 'none', lineHeight: 1 }}>
          {score.toFixed(1)}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'Dropline, sans-serif' }}>/10</span>
      </div>
    </div>
  );
}

function ScriptPageInner() {
  const params = useSearchParams();
  const [topic, setTopic]         = useState(params?.get('topic') || '');
  const [keyPoints, setKeyPoints] = useState('');
  const [script, setScript]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [hooks, setHooks]         = useState({ grab: '', promise: '', stakes: '' });
  const [abInputs, setAbInputs]   = useState({ curiosity: '', fear: '', result: '' });
  const [abVariants, setAbVariants] = useState({ curiosity: '', fear: '', result: '' });
  const [loadingAb, setLoadingAb] = useState(false);
  const [checks, setChecks]       = useState<boolean[]>(new Array(TOTAL_ITEMS).fill(false));

  useEffect(() => {
    try {
      const h = localStorage.getItem('lbx:hooks');
      const c = localStorage.getItem('lbx:checklist-v2');
      const a = localStorage.getItem('lbx:ab-inputs');
      if (h) setHooks(JSON.parse(h));
      if (c) { const p = JSON.parse(c); if (p.length === TOTAL_ITEMS) setChecks(p); }
      if (a) setAbInputs(JSON.parse(a));
    } catch {}
  }, []);

  const saveHooks = (next: typeof hooks) => { setHooks(next); localStorage.setItem('lbx:hooks', JSON.stringify(next)); };
  const saveChecks = (next: boolean[]) => { setChecks(next); localStorage.setItem('lbx:checklist-v2', JSON.stringify(next)); };
  const saveAb = (next: typeof abInputs) => { setAbInputs(next); localStorage.setItem('lbx:ab-inputs', JSON.stringify(next)); };

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
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

      {/* Retention metrics row */}
      <p className="section-title">Retention Benchmarks</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 28 }}>
        {METRICS.map((m, i) => (
          <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Dropline, sans-serif', fontWeight: 700, fontSize: 16, color: m.color, marginBottom: 4, letterSpacing: '0.08em' }}>{m.val}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'Dropline, sans-serif' }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flex: 1, gap: 24, overflow: 'hidden' }}>

        {/* LEFT: Script form + Hook + AB */}
        <div style={{ width: 480, display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto', paddingBottom: 20 }}>

          {/* Generate Script */}
          <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 style={{ fontSize: 13, margin: 0 }}>Generate Script</h2>
            <div>
              <label style={{ fontSize: 11, display: 'block', marginBottom: 6, color: 'var(--text-dim)', fontFamily: 'Dropline, sans-serif' }}>Video topic / title</label>
              <input style={{ width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 8, fontFamily: 'Dropline, sans-serif' }} value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. The $500M Gardner Museum Heist…" />
            </div>
            <div>
              <label style={{ fontSize: 11, display: 'block', marginBottom: 6, color: 'var(--text-dim)', fontFamily: 'Dropline, sans-serif' }}>Key points to cover</label>
              <textarea style={{ width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 8, resize: 'vertical', fontFamily: 'Dropline, sans-serif' }} rows={4} value={keyPoints} onChange={e => setKeyPoints(e.target.value)} placeholder="Key facts, unique angle, Grimm Archives Take…" />
            </div>
            <button onClick={generateScript} disabled={loading || !topic.trim()} style={{ padding: '10px 0', borderRadius: 10, fontSize: 12, fontWeight: 700, background: loading ? 'rgba(112,72,248,0.4)' : 'linear-gradient(135deg,var(--violet),var(--berry))', color: '#fff', border: 'none', cursor: loading || !topic.trim() ? 'not-allowed' : 'pointer', opacity: !topic.trim() ? 0.5 : 1, fontFamily: 'ChargerExtrabold, Outfit, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {loading ? '✨ Generating…' : '✨ Generate Full Retention Script'}
            </button>
          </div>

          {/* Hook Builder */}
          <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 13, margin: 0 }}>Hook Structure — First 30 Seconds</h2>
            {HOOK_SLOTS.map(slot => (
              <div key={slot.key}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontFamily: 'Dropline, sans-serif', fontSize: 10, fontWeight: 700, color: slot.color, letterSpacing: '0.08em' }}>{slot.label}</span>
                  <span style={{ fontFamily: 'Dropline, sans-serif', fontSize: 10, color: 'var(--lemon)', background: 'var(--lemon-dim)', padding: '2px 7px', borderRadius: 4, letterSpacing: '0.05em' }}>{slot.timing}</span>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 13, margin: 0 }}>AB Title Builder — 3 Variants Every Video</h2>
            </div>
            {AB_CARDS.map(card => (
              <div key={card.key} style={{ background: `rgba(255,255,255,0.03)`, border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontFamily: 'Dropline, sans-serif', fontSize: 10, fontWeight: 700, color: card.color, letterSpacing: '0.08em', marginBottom: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: card.color, display: 'inline-block', marginRight: 6, boxShadow: `0 0 4px ${card.color}` }} />
                  {card.label}
                </div>
                <textarea
                  style={{ width: '100%', padding: '8px 12px', fontSize: 12, borderRadius: 8, resize: 'none', fontFamily: 'Dropline, sans-serif', lineHeight: 1.5 }}
                  rows={2}
                  value={abInputs[card.key as keyof typeof abInputs]}
                  onChange={e => saveAb({ ...abInputs, [card.key]: e.target.value })}
                  placeholder={card.placeholder}
                />
                {abVariants[card.key as keyof typeof abVariants] && (
                  <div style={{ padding: '7px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Dropline, sans-serif', marginTop: 8 }}>
                    <span style={{ color: card.color, fontWeight: 600 }}>AI: </span>
                    {abVariants[card.key as keyof typeof abVariants]}
                  </div>
                )}
              </div>
            ))}
            <button onClick={generateAB} disabled={loadingAb || !topic.trim()} style={{ padding: '9px 0', borderRadius: 10, fontSize: 12, fontWeight: 700, background: 'rgba(155,120,255,0.15)', border: '1px solid rgba(155,120,255,0.3)', color: 'var(--violet-light)', cursor: loadingAb || !topic.trim() ? 'not-allowed' : 'pointer', opacity: !topic.trim() ? 0.5 : 1, fontFamily: 'ChargerExtrabold, Outfit, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {loadingAb ? 'Generating…' : '⚡ Generate AB Variants'}
            </button>
          </div>
        </div>

        {/* RIGHT: Checklist + output */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto', paddingBottom: 20 }}>

          {/* Checklist with SVG ring */}
          <div className="glass-card" style={{ padding: 22 }}>
            {/* Ring row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 18 }}>
              <ScoreRing score={score} pass={pass} />
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 13, margin: '0 0 6px' }}>Pre-Upload Checklist</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span className={`badge ${pass ? 'badge-live' : score >= 5 ? 'badge-mid' : 'badge-high'}`} style={{ fontSize: 11 }}>
                    {pass ? '✅ CLEAR TO UPLOAD' : score >= 5 ? '⚠️ FIX BEFORE UPLOAD' : '❌ BLOCKED'}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'Dropline, sans-serif' }}>
                    {checks.filter(Boolean).length}/{TOTAL_ITEMS} checked · pass at 7/10
                  </span>
                  <button onClick={() => saveChecks(new Array(TOTAL_ITEMS).fill(false))} style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Dropline, sans-serif' }}>
                    Reset
                  </button>
                </div>
              </div>
            </div>
            {/* Bar */}
            <div className="rpm-bar" style={{ height: 5, marginBottom: 18 }}>
              <div className="rpm-fill" style={{ width: `${(score / 10) * 100}%`, background: pass ? 'var(--mint)' : score >= 5 ? 'linear-gradient(90deg,var(--lemon),var(--berry))' : 'linear-gradient(90deg,#FF4444,var(--berry))' }} />
            </div>
            {/* Categories */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {CHECKLIST_CATS.map((cat, ci) => (
                <div key={cat.category}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: cat.color, boxShadow: `0 0 5px ${cat.color}` }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: cat.color, fontFamily: 'Dropline, sans-serif', letterSpacing: '0.08em' }}>{cat.category}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'Dropline, sans-serif' }}>({(cat.ptsEach * 5).toFixed(0)} pts max)</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {cat.items.map((item, ii) => {
                      const idx = ci * 5 + ii;
                      return (
                        <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                          <input type="checkbox" checked={checks[idx]} onChange={() => { const n = [...checks]; n[idx] = !n[idx]; saveChecks(n); }} style={{ marginTop: 2, accentColor: 'var(--violet)', flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: checks[idx] ? cat.color : 'var(--text-muted)', fontFamily: 'Dropline, sans-serif', lineHeight: 1.5 }}>
                            {item}
                            <span style={{ fontSize: 10, color: 'rgba(200,185,255,0.2)', marginLeft: 6 }}>+{cat.ptsEach}pt</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Script output */}
          {script && (
            <div className="glass-card" style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h2 style={{ fontSize: 13, margin: 0 }}>Generated Script</h2>
                <button onClick={() => navigator.clipboard.writeText(script)} style={{ fontSize: 11, padding: '6px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.07)', color: 'var(--text)', border: 'none', cursor: 'pointer', fontFamily: 'Dropline, sans-serif' }}>
                  Copy
                </button>
              </div>
              <div
                style={{ fontSize: 12, lineHeight: 1.7, overflowY: 'auto', flex: 1, padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', maxHeight: 520, fontFamily: 'Dropline, sans-serif' }}
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
