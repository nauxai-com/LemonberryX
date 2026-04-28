'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import TopBar from '@/components/layout/TopBar';

const TOOLS = [
  { name: 'Google Whisk',           use: 'AI image generation',                   color: '#F59E0B', url: 'https://labs.google/fx/tools/whisk' },
  { name: 'Hunyuan Video',          use: 'Cinematic AI clips (web)',               color: '#D946EF', url: 'https://video.hunyuan.tencent.com' },
  { name: 'NotebookLM',             use: 'Research + scripts',                     color: '#06B6D4', url: 'https://notebooklm.google.com' },
  { name: 'AI Ask Studio',          use: 'Validated video ideas',                  color: '#10B981', url: 'https://www.youtube.com/feed/you' },
  { name: 'ElevenLabs',             use: 'AI voiceover (Stability 0.40)',           color: '#7C3AED', url: 'https://elevenlabs.io' },
  { name: 'CapCut',                 use: 'Final assembly + auto-captions',         color: '#EF4444', url: 'https://www.capcut.com' },
  { name: 'Canva',                  use: '3 thumbnail AB variants',                color: '#F59E0B', url: 'https://www.canva.com' },
  { name: 'YouTube Studio',         use: 'Upload + AI disclosure + AB test',       color: '#EF4444', url: 'https://studio.youtube.com' },
  { name: 'auto-editor',            use: 'Silence removal (v29.3.1 ✓)',            color: '#10B981', url: 'https://github.com/WyattBlue/auto-editor' },
  { name: 'short-video-maker',      use: 'Shorts factory — text → vertical video', color: '#06B6D4', url: 'http://localhost:3123' },
  { name: 'AI-Shorts-Generator',    use: 'Viral clip detector — scores 0-100',     color: '#D946EF', url: 'https://github.com/SamurAIGPT/AI-Youtube-Shorts-Generator' },
  { name: 'ViMax',                  use: 'Multi-agent documentary pipeline',       color: '#7C3AED', url: 'https://github.com/HKUDS/ViMax' },
  { name: 'Crawl4AI',              use: 'LLM-friendly web crawler ✓',              color: '#10B981', url: 'https://github.com/unclecode/crawl4ai' },
  { name: 'OpenMontage',            use: 'Agentic full video production',          color: '#F59E0B', url: 'https://github.com/calesthio/OpenMontage' },
];

const AUTOMATIONS = [
  { label: '🔍 Run Daily Research',  action: 'research',   desc: 'Crawl4AI scrapes Grimm Archives topics' },
  { label: '🎬 Generate Short',      action: 'short',      desc: 'Triggers short-video-maker Docker' },
  { label: '✂️ Detect Viral Clips',  action: 'clips',      desc: 'AI-Shorts-Generator on latest upload' },
  { label: '🤖 Full ViMax Run',      action: 'vimax',      desc: 'Triggers full ViMax pipeline' },
];

const SCHEDULE = [
  { day: 'Monday',    task: 'Research — Crawl4AI auto-scrape + NotebookLM pull', time: '20 min' },
  { day: 'Tuesday',   task: 'Script + 3 AB title variants',                        time: '45 min' },
  { day: 'Wednesday', task: 'Whisk images + Hunyuan clips batch',                  time: '45 min' },
  { day: 'Thursday',  task: 'Voiceover + title alignment check',                   time: '25 min' },
  { day: 'Saturday',  task: 'auto-editor → CapCut → thumbnails → upload + Shorts', time: '90 min' },
];

const REPOS = [
  { name: 'claude-youtube',              url: 'https://github.com/AgriciDaniel/claude-youtube' },
  { name: 'short-video-maker',           url: 'https://github.com/gyoridavid/short-video-maker' },
  { name: 'AI-Youtube-Shorts-Generator', url: 'https://github.com/SamurAIGPT/AI-Youtube-Shorts-Generator' },
  { name: 'ViMax',                       url: 'https://github.com/HKUDS/ViMax' },
  { name: 'FramePack',                   url: 'https://github.com/lllyasviel/FramePack' },
  { name: 'HunyuanVideo',               url: 'https://github.com/Tencent-Hunyuan/HunyuanVideo' },
  { name: 'LTX-Video',                   url: 'https://github.com/Lightricks/LTX-Video' },
  { name: 'auto-editor',                 url: 'https://github.com/WyattBlue/auto-editor' },
  { name: 'crawl4ai',                    url: 'https://github.com/unclecode/crawl4ai' },
  { name: 'Scrapling',                   url: 'https://github.com/D4Vinci/Scrapling' },
  { name: 'viral-ai-vids',              url: 'https://github.com/kaymen99/viral-ai-vids' },
  { name: 'opencut',                     url: 'https://github.com/opencut-app/opencut' },
  { name: 'OpenMontage',                 url: 'https://github.com/calesthio/OpenMontage' },
  { name: 'n8n',                         url: 'https://github.com/n8n-io/n8n' },
];

export default function ToolsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const trigger = async (action: string) => {
    setLoading(action);
    try {
      const res = await fetch('/api/trigger', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
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
    <div className="flex flex-col" style={{ minHeight: "100%" }}>
      <TopBar title="Tools" subtitle="Production stack + n8n automation triggers" />
      <div className="flex-1 overflow-auto p-8 space-y-8">

        {/* Tool Grid */}
        <div>
          <h2 className="text-lg mb-4">Production Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {TOOLS.map(t => (
              <a
                key={t.name}
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-4 flex flex-col gap-2 cursor-pointer group transition-all"
                style={{ textDecoration: 'none' }}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
                <div className="font-semibold text-sm" style={{ color: '#fff', fontFamily: 'Outfit' }}>{t.name}</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{t.use}</div>
              </a>
            ))}
          </div>
        </div>

        {/* n8n Triggers */}
        <div className="glass-card p-6">
          <h2 className="text-lg mb-4">Automation Triggers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AUTOMATIONS.map(a => (
              <button
                key={a.action}
                onClick={() => trigger(a.action)}
                disabled={!!loading}
                className="flex items-center gap-4 p-4 rounded-xl text-left transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', opacity: loading && loading !== a.action ? 0.5 : 1 }}
              >
                <div className="text-2xl">{a.label.split(' ')[0]}</div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: '#fff' }}>{a.label.slice(2).trim()}</div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{a.desc}</div>
                </div>
                {loading === a.action && <div className="ml-auto w-4 h-4 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />}
              </button>
            ))}
          </div>
        </div>

        {/* Weekly Schedule + Repos */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="glass-card p-5">
            <h2 className="text-lg mb-4">Weekly Schedule</h2>
            <table className="w-full">
              <thead>
                <tr>
                  {['Day', 'Task', 'Time'].map(h => <th key={h} className="text-left text-xs pb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {SCHEDULE.map(row => (
                  <tr key={row.day} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <td className="py-2.5 pr-4 text-sm font-semibold" style={{ color: '#D946EF', minWidth: 96 }}>{row.day}</td>
                    <td className="py-2.5 pr-4 text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>{row.task}</td>
                    <td className="py-2.5 text-xs" style={{ color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="glass-card p-5">
            <h2 className="text-lg mb-4">Repo Quick Links</h2>
            <div className="grid grid-cols-2 gap-1.5">
              {REPOS.map(r => (
                <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs px-3 py-2 rounded-lg flex items-center gap-2 transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.65)', textDecoration: 'none' }}>
                  <span>⚡</span>{r.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}
