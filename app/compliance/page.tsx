'use client';
import { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';

const SCORECARD = [
  { category: 'ORIGINALITY', color: '#7C3AED', points: 3, items: [
    'Script has unique angle not found in any single source (+1)',
    'Video includes original interpretation, theory, or "Creator Take" (+1)',
    'Research used 3+ distinct sources synthesized together (+1)',
  ]},
  { category: 'PRODUCTION AUTHENTICITY', color: '#D946EF', points: 4, items: [
    'Voiceover has tonal variation — not flat delivery (+1)',
    'Visuals include motion video clips, not just static images (+1)',
    'This video\'s structure is different from the last 3 videos (+1)',
    'No recycled visual assets from previous videos (+1)',
  ]},
  { category: 'COMPLIANCE', color: '#06B6D4', points: 3, items: [
    'AI disclosure toggled ON in YouTube Studio (+1)',
    'Script has been human-reviewed and rewritten (not raw AI output) (+1)',
    'No simulation of real news events or realistic AI of named real people (+1)',
  ]},
];

// dot colors: critical=red, high=berry, medium=lemon
const THREATS = [
  { level: 'CRITICAL', dotColor: '#EF4444', name: 'Templated Script Structure',        desc: 'Same hook→exposition→reveal→CTA pattern identically across videos.', solution: 'Vary hook type per video. Rewrite 20-30% in your own voice. Rotate CTA phrasing.' },
  { level: 'CRITICAL', dotColor: '#EF4444', name: 'Robotic AI Voiceover',              desc: 'Flat TTS with no tonal variation — #1 audio signal of inauthentic content.', solution: 'ElevenLabs: Stability 0.40, Similarity 0.75, Style 0.65. Add [PAUSE][WHISPER][DRAMATIC] cues.' },
  { level: 'CRITICAL', dotColor: '#EF4444', name: 'Static Image Slideshow',            desc: 'Whisk-only production with no motion = inauthentic content flag.', solution: 'Min ratio: 60% motion / 40% static. At least 3-5 Hunyuan clips per video.' },
  { level: 'CRITICAL', dotColor: '#EF4444', name: 'Template Clone Detection',          desc: 'Same structure, pacing, visual style across last 10 videos — channel-level flag.', solution: 'Every 4th video: break format. Rotate thumbnail styles. Vary upload times ±2-3 days.' },
  { level: 'CRITICAL', dotColor: '#EF4444', name: 'News / Events Simulation',          desc: 'AI visuals depicting real people, fake news formatting, realistic AI faces.', solution: 'Use atmospheric/symbolic visuals only. Never generate realistic AI video of real named people.' },
  { level: 'HIGH',     dotColor: '#D946EF', name: 'Script Not Genuinely Original',     desc: 'Script is essentially the Wikipedia article reordered — fails originality test.', solution: 'Every video needs 1 of: original theory, modern parallel, financial analysis.' },
  { level: 'HIGH',     dotColor: '#D946EF', name: 'AI Disclosure Non-Compliance',      desc: 'Failure to disclose AI voice/visuals — policy violation, potential channel strike.', solution: 'Toggle "Altered or synthetic content" ON in YouTube Studio for EVERY video.' },
  { level: 'MEDIUM',   dotColor: '#F59E0B', name: 'Over-Uploading / Frequency',        desc: 'High upload frequency + similar content structure = automated spam signal.', solution: 'Long-form: max 2-3/week. Shorts: max 3-4/week. n8n stagger to 1 Short/day.' },
  { level: 'MEDIUM',   dotColor: '#F59E0B', name: 'Reused Visual Assets',              desc: 'Same B-roll clips, Pexels videos, Hunyuan outputs, background music across videos.', solution: 'Never reuse a Hunyuan/Whisk asset. Use different Pexels search terms. Rotate 8-10 music tracks.' },
  { level: 'CRITICAL', dotColor: '#EF4444', name: 'Strike Response Protocol',          desc: 'A strike or demonetization warning has been issued.', solution: '1. STOP uploads 7 days. 2. Do NOT delete flagged video. 3. Read exact violation in YT Studio. 4. Audit last 10 videos. 5. Document creative process. 6. Submit appeal. 7. Fix flagged element. 8. Resume 1/week for 30 days.' },
];

const SAFE = [
  'Original script with unique angle + Grimm Archives Take',
  'Human-reviewed and rewritten AI output',
  'AI disclosure enabled in YouTube Studio (every video)',
  'Atmospheric / symbolic visuals — never realistic real people',
  '60%+ motion video content ratio (Hunyuan + Pexels)',
  '3+ distinct research sources synthesized',
  'Tonal voiceover variation — ElevenLabs stability < 0.45',
  'Max 3 long-form uploads per week',
  'Structure varied every 4th video minimum',
  'Original financial theory or analysis added per video',
];

const KILL = [
  'Raw AI script copy-pasted and uploaded without rewriting',
  'Flat robotic TTS voiceover with zero variation',
  'Static image slideshow — no motion clips at all',
  'Realistic AI-generated faces of real named people',
  'Identical hook/template structure across 5+ consecutive videos',
  'Uploading without AI disclosure toggle enabled',
  'Reusing the same Hunyuan or Whisk clips across videos',
  'Simulating real news events or broadcast-style formatting',
  'More than 4 uploads per week on one channel',
  'Same opening line or hook on every video',
];

export default function CompliancePage() {
  const totalItems = SCORECARD.flatMap(s => s.items).length;
  const [checks, setChecks]     = useState<boolean[]>(new Array(totalItems).fill(false));
  const [script, setScript]     = useState('');
  const [result, setResult]     = useState<any>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lbx:compliance-checks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length === totalItems) setChecks(parsed);
      }
    } catch {}
  }, []);

  const score = checks.filter(Boolean).length;
  const pass  = score >= 7;

  const toggle = (i: number) => {
    const next = [...checks];
    next[i] = !next[i];
    setChecks(next);
    localStorage.setItem('lbx:compliance-checks', JSON.stringify(next));
  };

  const runCheck = async () => {
    if (!script.trim()) return;
    setChecking(true);
    try {
      const res = await fetch('/api/comply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script }),
      });
      setResult(await res.json());
    } catch {}
    setChecking(false);
  };

  let checkIdx = 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <TopBar title="Compliance" subtitle="YT Inauthentic Content Prevention System 2026" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 0' }}>

        {/* Top row: Scorecard + AI Checker */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>

          {/* Scorecard */}
          <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 16, margin: 0 }}>Pre-Upload Scorecard</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24, fontWeight: 900, fontFamily: 'ChargerExtrabold, Outfit', color: pass ? '#10B981' : '#EF4444', WebkitTextFillColor: pass ? '#10B981' : '#EF4444', background: 'none' }}>
                  {score}/10
                </span>
                <span className={`badge ${pass ? 'badge-live' : 'badge-high'}`}>{pass ? '✅ PASS' : '❌ FIX'}</span>
              </div>
            </div>
            {/* Score bar */}
            <div className="rpm-bar" style={{ height: 8 }}>
              <div className="rpm-fill" style={{ width: `${(score / 10) * 100}%`, background: pass ? '#10B981' : 'linear-gradient(135deg,#EF4444,#F59E0B)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {SCORECARD.map(cat => (
                <div key={cat.category}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: cat.color, fontFamily: 'Dropline, sans-serif', letterSpacing: '0.06em' }}>{cat.category}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'Dropline, sans-serif' }}>({cat.points} pts)</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {cat.items.map(item => {
                      const i = checkIdx++;
                      return (
                        <label key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                          <input type="checkbox" checked={checks[i]} onChange={() => toggle(i)} style={{ marginTop: 2, accentColor: '#7C3AED', flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: checks[i] ? '#10B981' : 'rgba(255,255,255,0.55)', fontFamily: 'Dropline, sans-serif', lineHeight: 1.5 }}>{item}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => { const n = new Array(totalItems).fill(false); setChecks(n); localStorage.setItem('lbx:compliance-checks', JSON.stringify(n)); }}
              style={{ alignSelf: 'flex-start', fontSize: 12, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Dropline, sans-serif' }}
            >
              Reset
            </button>
          </div>

          {/* AI Checker */}
          <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 16, margin: 0 }}>AI Compliance Checker</h2>
            <textarea
              style={{ width: '100%', padding: '10px 12px', fontSize: 12, borderRadius: 10, resize: 'vertical', fontFamily: 'Dropline, sans-serif', lineHeight: 1.6 }}
              rows={9}
              value={script}
              onChange={e => setScript(e.target.value)}
              placeholder="Paste your script here for AI compliance analysis…"
            />
            <button
              onClick={runCheck}
              disabled={checking || !script.trim()}
              style={{
                padding: '10px 0', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: checking || !script.trim() ? 'not-allowed' : 'pointer',
                background: checking ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg,#7C3AED,#D946EF)',
                color: '#fff', border: 'none', fontFamily: 'Dropline, sans-serif',
              }}
            >
              {checking ? '🛡️ Analyzing…' : '🛡️ Run Compliance Check'}
            </button>
            {result && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 24, fontWeight: 900, fontFamily: 'ChargerExtrabold, Outfit', color: result.pass ? '#10B981' : '#EF4444', WebkitTextFillColor: result.pass ? '#10B981' : '#EF4444', background: 'none' }}>
                    {result.score}/10
                  </span>
                  <span className={`badge ${result.pass ? 'badge-live' : 'badge-high'}`}>{result.pass ? '✅ PASS' : '❌ FIX BEFORE UPLOADING'}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[['Originality', result.originality, 3], ['Production', result.production, 4], ['Policy', result.policy, 3]].map(([l, v, m]) => (
                    <div key={l as string} style={{ textAlign: 'center', padding: 10, borderRadius: 10, background: 'rgba(255,255,255,0.04)' }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#D946EF', fontFamily: 'ChargerExtrabold, Outfit', WebkitTextFillColor: '#D946EF', background: 'none' }}>{v}/{m}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontFamily: 'Dropline, sans-serif' }}>{l}</div>
                    </div>
                  ))}
                </div>
                {result.flags?.length > 0 && (
                  <div style={{ padding: 12, borderRadius: 10, background: 'rgba(239,68,68,0.08)', borderLeft: '3px solid #EF4444' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', marginBottom: 6, fontFamily: 'Dropline, sans-serif' }}>Flags</div>
                    {result.flags.map((f: string, i: number) => <div key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: 'Dropline, sans-serif' }}>• {f}</div>)}
                  </div>
                )}
                {result.recommendations?.length > 0 && (
                  <div style={{ padding: 12, borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#10B981', marginBottom: 6, fontFamily: 'Dropline, sans-serif' }}>Recommendations</div>
                    {result.recommendations.map((r: string, i: number) => <div key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: 'Dropline, sans-serif' }}>• {r}</div>)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 10 Threat Rows */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 17, marginBottom: 16 }}>10 Threat Categories</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {THREATS.map((t, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '14px 18px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderLeft: `3px solid ${t.dotColor}`,
                }}
              >
                {/* Severity dot */}
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: t.dotColor, flexShrink: 0, marginTop: 4,
                  boxShadow: `0 0 8px ${t.dotColor}60`,
                }} />
                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#fff', fontFamily: 'Dropline, sans-serif' }}>{t.name}</span>
                    <span style={{
                      padding: '2px 9px', borderRadius: 999, fontSize: 10, fontWeight: 700,
                      background: `${t.dotColor}22`, color: t.dotColor, border: `1px solid ${t.dotColor}44`,
                      fontFamily: 'Dropline, sans-serif', letterSpacing: '0.06em',
                    }}>{t.level}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.55, marginBottom: 6, fontFamily: 'Dropline, sans-serif' }}>{t.desc}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.55, fontFamily: 'Dropline, sans-serif' }}>
                    <span style={{ color: '#10B981', fontWeight: 600 }}>Fix: </span>{t.solution}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safe vs Kill Reference */}
        <div>
          <h2 style={{ fontSize: 17, marginBottom: 16 }}>Quick Reference</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

            {/* SAFE */}
            <div style={{
              background: 'rgba(16,185,129,0.06)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 14, padding: '22px 26px',
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#10B981', marginBottom: 18, letterSpacing: '0.06em', fontFamily: 'Dropline, sans-serif' }}>
                ✅ SAFE — DO THIS
              </div>
              {SAFE.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 11, alignItems: 'flex-start' }}>
                  <span style={{ color: '#10B981', flexShrink: 0, marginTop: 1, fontSize: 13 }}>→</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, fontFamily: 'Dropline, sans-serif' }}>{item}</span>
                </div>
              ))}
            </div>

            {/* KILL */}
            <div style={{
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.22)',
              borderRadius: 14, padding: '22px 26px',
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#EF4444', marginBottom: 18, letterSpacing: '0.06em', fontFamily: 'Dropline, sans-serif' }}>
                ❌ KILL — NEVER DO
              </div>
              {KILL.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 11, alignItems: 'flex-start' }}>
                  <span style={{ color: '#EF4444', flexShrink: 0, marginTop: 1, fontSize: 13 }}>✕</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, fontFamily: 'Dropline, sans-serif' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
