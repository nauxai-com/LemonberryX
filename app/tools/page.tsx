'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

const TOOLS = [
  { tier: 'T1 — Script & SEO',    tierColor: 'var(--lemon)',         name: 'AgriciDaniel/claude-youtube',         desc: 'Retention scripts, SEO, hooks, thumbnails — 14 sub-skills',          installed: true  },
  { tier: 'T1 — Script & SEO',    tierColor: 'var(--lemon)',         name: 'alirezarezvani/claude-skills',         desc: '232+ Claude Code skills — 43 marketing skills',                       installed: false },
  { tier: 'T2 — Automation',      tierColor: 'var(--mint)',          name: 'gyoridavid/short-video-maker ⭐',      desc: 'Shorts factory — Kokoro TTS + Pexels + Whisper captions + music',     installed: false },
  { tier: 'T2 — Automation',      tierColor: 'var(--mint)',          name: 'SamurAIGPT/AI-Shorts-Generator ⭐',    desc: 'Auto-detects viral moments — virality scored 0–100',                  installed: false },
  { tier: 'T2 — Automation',      tierColor: 'var(--mint)',          name: 'calesthio/OpenMontage',               desc: 'Agentic full production — plain prompt → full video assembly',         installed: false },
  { tier: 'T2 — Automation',      tierColor: 'var(--mint)',          name: 'HKUDS/ViMax',                         desc: 'Multi-agent documentary — Director + Screenwriter + Producer',         installed: false },
  { tier: 'T3 — Research',        tierColor: 'var(--violet-light)',  name: 'unclecode/crawl4ai',                  desc: 'LLM-friendly web crawler — outputs clean Markdown',                   installed: true  },
  { tier: 'T3 — Research',        tierColor: 'var(--violet-light)',  name: 'D4Vinci/Scrapling',                   desc: 'Adaptive scraper — bypasses Cloudflare, stealth browsing',             installed: false },
  { tier: 'T3 — Research',        tierColor: 'var(--violet-light)',  name: 'teng-lin/notebooklm-py',              desc: 'Pull scripts + ideas from NotebookLM programmatically',               installed: true  },
  { tier: 'T4 — Video Gen (GPU)', tierColor: 'var(--berry)',         name: 'lllyasviel/FramePack',                desc: 'Long-form coherent AI video — constant memory, 6GB VRAM',             installed: false },
  { tier: 'T4 — Video Gen (GPU)', tierColor: 'var(--berry)',         name: 'Tencent-Hunyuan/HunyuanVideo-1.5',    desc: '8.3B params — 720p in 75s on RTX 4090',                               installed: false },
  { tier: 'T4 — Video Gen (GPU)', tierColor: 'var(--berry)',         name: 'Lightricks/LTX-Video',                desc: 'Speed-first — 10s/clip, 4K capable, ComfyUI native',                  installed: false },
  { tier: 'T5 — Editing',         tierColor: '#FF9D4D',              name: 'WyattBlue/auto-editor v29.3.1',       desc: 'Automated silence removal — fully automated Stage 7',                 installed: true  },
  { tier: 'T5 — Editing',         tierColor: '#FF9D4D',              name: 'opencut-app/OpenCut',                 desc: 'Open-source CapCut alternative — no watermarks',                      installed: false },
  { tier: 'T6 — Infrastructure',  tierColor: '#4DC8FF',              name: 'n8n-io/n8n (Oracle)',                 desc: 'Workflow automation — connects all tools, schedules tasks',            installed: false },
  { tier: 'T6 — Infrastructure',  tierColor: '#4DC8FF',              name: 'OpenRouter',                          desc: 'Route AI calls to 300+ models — free tier auto-routing',              installed: false },
  { tier: 'Misc',                 tierColor: 'var(--lemon)',         name: 'yt-dlp v2026.3.17',                   desc: 'YouTube downloader for AI-Shorts-Generator processing',                installed: true  },
  { tier: 'Misc',                 tierColor: 'var(--lemon)',         name: 'ElevenLabs',                          desc: 'AI voiceover — Stab:0.40 Sim:0.75 Style:0.65 Speaker Boost ON',      installed: false },
];

const AUTOMATIONS = [
  { label: '🔍 Run Daily Research', action: 'research', desc: 'Crawl4AI scrapes Grimm Archives topics' },
  { label: '🎬 Generate Short',     action: 'short',    desc: 'Triggers short-video-maker Docker' },
  { label: '✂️ Detect Viral Clips', action: 'clips',    desc: 'AI-Shorts-Generator on latest upload' },
  { label: '🤖 Full ViMax Run',     action: 'vimax',    desc: 'Triggers full ViMax pipeline' },
];

export default function ToolsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const trigger = async (action: string) => {
    setLoading(action);
    try {
      const res  = await fetch('/api/trigger', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
      const data = await res.json();
      setToast({ msg: data.message || 'Triggered successfully', type: 'success' });
    } catch {
      setToast({ msg: 'Trigger failed — check n8n connection', type: 'error' });
    } finally {
      setLoading(null);
      setTimeout(() => setToast(null), 3500);
    }
  };

  return (
    <div className="fade-in">
      {/* Tool Grid */}
      <p className="section-title">Full Tool Stack — All Tiers</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
        {TOOLS.map((t, i) => (
          <div key={i} className="tool-card">
            <div style={{ fontFamily: 'Dropline, sans-serif', fontSize: 9, color: t.tierColor, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
              {t.tier}
            </div>
            <div style={{
              fontFamily: 'ChargerExtrabold, Outfit, sans-serif', fontWeight: 700,
              fontSize: 12, textTransform: 'uppercase', color: 'var(--text)',
              WebkitTextFillColor: 'var(--text)', background: 'none', marginBottom: 4,
            }}>
              {t.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.45, fontFamily: 'Dropline, sans-serif' }}>
              {t.desc}
            </div>
            {t.installed && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8,
                fontFamily: 'Dropline, sans-serif', fontSize: 9, color: 'var(--mint)',
                background: 'var(--mint-dim)', padding: '2px 7px', borderRadius: 4,
              }}>
                ✓ Installed
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Automation triggers */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 32 }}>
        <h2 style={{ fontSize: 14, marginBottom: 16 }}>Automation Triggers</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {AUTOMATIONS.map(a => (
            <button
              key={a.action}
              onClick={() => trigger(a.action)}
              disabled={!!loading}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderRadius: 12, textAlign: 'left',
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading && loading !== a.action ? 0.5 : 1,
                transition: 'border-color 0.2s',
              }}
            >
              <span style={{ fontSize: 22 }}>{a.label.split(' ')[0]}</span>
              <div>
                <div style={{ fontFamily: 'ChargerExtrabold, Outfit, sans-serif', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'var(--text)', WebkitTextFillColor: 'var(--text)', background: 'none' }}>
                  {a.label.slice(2).trim()}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'Dropline, sans-serif', marginTop: 2 }}>
                  {a.desc}
                </div>
              </div>
              {loading === a.action && (
                <div style={{ marginLeft: 'auto', width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--violet)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
