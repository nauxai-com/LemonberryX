'use client';
import { useState } from 'react';
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

const THREATS = [
  { level: 'CRITICAL', color: '#EF4444', emoji: '🔴', name: 'Templated Script Structure', desc: 'Same hook→exposition→reveal→CTA pattern identically across videos.', solution: 'Vary hook type per video. Rewrite 20-30% in your own voice. Rotate CTA phrasing. Add "unique angle note" before generating.' },
  { level: 'CRITICAL', color: '#EF4444', emoji: '🔴', name: 'Robotic AI Voiceover', desc: 'Flat TTS with no tonal variation — #1 audio signal of inauthentic content.', solution: 'ElevenLabs: Stability 0.40, Similarity 0.75, Style 0.65. Add [PAUSE][WHISPER][DRAMATIC] SSML cues. Rotate 2-3 voices.' },
  { level: 'CRITICAL', color: '#EF4444', emoji: '🔴', name: 'Static Image Slideshow', desc: 'Whisk-only production with no motion = inauthentic content flag.', solution: 'Min ratio: 60% motion / 40% static. At least 3-5 Hunyuan clips per video. Apply Ken Burns to every static image.' },
  { level: 'CRITICAL', color: '#EF4444', emoji: '🔴', name: 'Template Clone Detection', desc: 'Same structure, pacing, visual style across last 10 videos — channel-level flag.', solution: 'Every 4th video: break format. Rotate thumbnail styles. Vary upload times ±2-3 days.' },
  { level: 'CRITICAL', color: '#EF4444', emoji: '🔴', name: 'News/Events Simulation', desc: 'AI visuals depicting real people, fake news formatting, realistic AI faces.', solution: 'Use atmospheric/symbolic visuals only. Never generate realistic AI video of real named people. Add accuracy qualifiers.' },
  { level: 'HIGH',     color: '#F59E0B', emoji: '🟠', name: 'Script Not Genuinely Original', desc: 'Script is essentially the Wikipedia article reordered — fails originality test.', solution: 'Every video needs 1 of: original theory, modern parallel, financial analysis. Research minimum 3+ distinct sources.' },
  { level: 'HIGH',     color: '#F59E0B', emoji: '🟠', name: 'AI Disclosure Non-Compliance', desc: 'Failure to disclose AI voice/visuals — policy violation, potential channel strike.', solution: 'Toggle "Altered or synthetic content" ON in YouTube Studio for EVERY video. No exceptions for Grimm Archives.' },
  { level: 'MEDIUM',   color: '#06B6D4', emoji: '🟡', name: 'Over-Uploading / Frequency', desc: 'High upload frequency + similar content structure = automated spam signal.', solution: 'Long-form: max 2-3/week. Shorts: max 3-4/week. Spread across Mon/Wed/Fri. n8n stagger to 1 Short/day.' },
  { level: 'MEDIUM',   color: '#06B6D4', emoji: '🟡', name: 'Reused Visual Assets', desc: 'Same B-roll clips, Pexels videos, Hunyuan outputs, background music across videos.', solution: 'Never reuse a Hunyuan/Whisk asset. Use different Pexels search terms. Rotate 8-10 music tracks.' },
  { level: 'CRITICAL', color: '#EF4444', emoji: '🔴', name: '⚠️ Strike Response Protocol', desc: 'A strike or demonetization warning has been issued.', solution: '1. STOP uploads 7 days. 2. Do NOT delete flagged video. 3. Read exact violation in YT Studio. 4. Audit last 10 videos. 5. Document creative process. 6. Submit appeal with evidence. 7. Fix flagged element. 8. Resume 1/week for 30 days.' },
];

export default function CompliancePage() {
  const [checks, setChecks] = useState<boolean[]>(new Array(SCORECARD.flatMap(s => s.items).length).fill(false));
  const [openThreats, setOpenThreats] = useState<number[]>([]);
  const [script, setScript] = useState('');
  const [result, setResult] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  const score = checks.filter(Boolean).length;
  const pass = score >= 7;

  const toggle = (i: number) => setChecks(p => { const n = [...p]; n[i] = !n[i]; return n; });
  const toggleThreat = (i: number) => setOpenThreats(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);

  const runCheck = async () => {
    if (!script.trim()) return;
    setChecking(true);
    const res = await fetch('/api/comply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ script }) });
    setResult(await res.json());
    setChecking(false);
  };

  let checkIdx = 0;

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Compliance" subtitle="YT Inauthentic Content Prevention System 2026" />
      <div className="flex-1 overflow-auto p-8 grid grid-cols-1 xl:grid-cols-2 gap-6 content-start">

        {/* Scorecard */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg">Pre-Upload Scorecard</h2>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold" style={{ color: pass ? '#10B981' : '#EF4444', fontFamily: 'Outfit' }}>{score}/10</span>
              <span className={`badge ${pass ? 'badge-live' : 'badge-high'}`}>{pass ? '✅ PASS' : '❌ FIX'}</span>
            </div>
          </div>
          {/* Score bar */}
          <div className="rpm-bar" style={{ height: 8 }}>
            <div className="rpm-fill" style={{ width: `${(score / 10) * 100}%`, background: pass ? '#10B981' : 'linear-gradient(135deg,#EF4444,#F59E0B)' }} />
          </div>
          <div className="space-y-4">
            {SCORECARD.map(cat => (
              <div key={cat.category}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold" style={{ color: cat.color }}>{cat.category}</span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>({cat.points} pts)</span>
                </div>
                <div className="space-y-1.5">
                  {cat.items.map((item) => {
                    const i = checkIdx++;
                    return (
                      <label key={i} className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={checks[i]} onChange={() => toggle(i)} className="mt-0.5 accent-purple-500" />
                        <span className="text-xs" style={{ color: checks[i] ? '#10B981' : 'rgba(255,255,255,0.55)' }}>{item}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Checker */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <h2 className="text-lg">AI Compliance Checker</h2>
          <textarea
            className="w-full px-3 py-2 text-xs rounded-lg"
            rows={8}
            value={script}
            onChange={e => setScript(e.target.value)}
            placeholder="Paste your script here for AI compliance analysis…"
          />
          <button
            onClick={runCheck}
            disabled={checking || !script.trim()}
            className="py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: checking ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg,#7C3AED,#D946EF)', color: '#fff' }}
          >
            {checking ? '🛡️ Analyzing…' : '🛡️ Run Compliance Check'}
          </button>
          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold" style={{ color: result.pass ? '#10B981' : '#EF4444', fontFamily: 'Outfit' }}>{result.score}/10</span>
                <span className={`badge ${result.pass ? 'badge-live' : 'badge-high'}`}>{result.pass ? '✅ PASS' : '❌ FIX BEFORE UPLOADING'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[['Originality', result.originality, 3], ['Production', result.production, 4], ['Policy', result.policy, 3]].map(([l, v, m]) => (
                  <div key={l as string} className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="text-lg font-bold" style={{ color: '#D946EF', fontFamily: 'Outfit' }}>{v}/{m}</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{l}</div>
                  </div>
                ))}
              </div>
              {result.flags?.length > 0 && (
                <div className="p-3 rounded-lg warning-critical">
                  <div className="text-xs font-semibold mb-1" style={{ color: '#EF4444' }}>Flags</div>
                  {result.flags.map((f: string, i: number) => <div key={i} className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>• {f}</div>)}
                </div>
              )}
              {result.recommendations?.length > 0 && (
                <div className="p-3 rounded-lg" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <div className="text-xs font-semibold mb-1" style={{ color: '#10B981' }}>Recommendations</div>
                  {result.recommendations.map((r: string, i: number) => <div key={i} className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>• {r}</div>)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Threat Cards */}
        <div className="xl:col-span-2 flex flex-col gap-2">
          <h2 className="text-lg mb-1">10 Threat Categories</h2>
          {THREATS.map((t, i) => (
            <div key={i} className={`rounded-xl overflow-hidden warning-${t.level.toLowerCase()}`}>
              <button
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
                onClick={() => toggleThreat(i)}
              >
                <span>{t.emoji}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: `${t.color}20`, color: t.color }}>
                  {t.level}
                </span>
                <span className="text-sm font-semibold" style={{ color: '#fff' }}>{t.name}</span>
                <span className="ml-auto text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{openThreats.includes(i) ? '▲' : '▼'}</span>
              </button>
              {openThreats.includes(i) && (
                <div className="px-4 pb-4 space-y-3">
                  <div>
                    <div className="text-xs font-semibold mb-1" style={{ color: t.color }}>Detected Issue</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>{t.desc}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold mb-1" style={{ color: '#10B981' }}>Solution</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>{t.solution}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
