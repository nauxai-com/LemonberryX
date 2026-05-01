'use client';
import { useState, useEffect, useCallback } from 'react';

// ── TYPES ────────────────────────────────────────────────────────────

interface EditorData { script: string; voice: string; visual: string; ct: string; notes: string; ht: number }
interface UploadPackage {
  titleA: string; titleB: string; titleC: string; selectedTitle: string;
  descHook: string; descChapters: string; descKW: string; descCTA: string; descHT: string;
  tags: string[]; thumbBg: string; thumbTxt: string; thumbEmo: string; thumbSty: string;
  playlist: string; pinnedComment: string; aiDisclosure: boolean;
}
interface Video {
  id: string; channel: string; type: 'long-form' | 'short'; title: string;
  scheduledDate: string; scheduledTime: string;
  status: 'pending' | 'failed' | 'approved' | 'scheduled' | 'live';
  complianceScore: number; compliance: Record<string, boolean>;
  editorData: EditorData; uploadPackage: UploadPackage | null;
}
interface PendingItem { id: string; channel: string; type: string; title: string; complianceScore: number; failed: boolean }

// ── CONSTANTS ─────────────────────────────────────────────────────────

const CHANNELS: Record<string, { name: string; color: string }> = {
  'CH-01': { name: 'Grimm Archives',     color: '#00D4AA' },
  'CH-02': { name: 'Betrayal & Revenge', color: '#FF3B8C' },
  'CH-03': { name: 'Jungian Psychology', color: '#9B78FF' },
  'CH-04': { name: 'Sleep Soundscapes',  color: '#4FC3F7' },
};
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const CHECK_ITEMS = [
  {id:'c1',  t:'No "Hey guys welcome back" opener'},
  {id:'c2',  t:'Unique angle — not a single-source summary'},
  {id:'c3',  t:'Includes original interpretation or Creator Take'},
  {id:'c4',  t:'Research from 3+ distinct sources synthesized'},
  {id:'c5',  t:'Hook: Grab (0–5s) + Promise (5–15s) + Stakes (15–30s)'},
  {id:'c6',  t:'Voiceover has tonal variation — not flat TTS delivery'},
  {id:'c7',  t:'60%+ motion video clips — not static image slideshow'},
  {id:'c8',  t:'Structure differs from the last 3 videos published'},
  {id:'c9',  t:'No recycled visual assets from previous videos'},
  {id:'c10', t:'Pattern interrupt every 60–90 seconds in edit'},
  {id:'c11', t:'AI disclosure toggled ON in YouTube Studio'},
  {id:'c12', t:'Script human-reviewed and rewritten 30%+'},
  {id:'c13', t:'No fake news simulation or realistic AI of named people'},
];

const TITLES_CH01 = ['Gardner Museum Heist','Lufthansa Heist','Lost Dutchman Gold','Ronin Network Hack','Yamashita Gold','Copper Scroll Treasure','Charles Ponzi','Nazi Gold Train','Mt Gox Collapse','D.B. Cooper','The Amber Room','El Dorado','Maple Syrup Heist','King John Treasure','QuadrigaCX'];
const DEMO_PENDING: PendingItem[] = [
  {id:'p-001',channel:'CH-01',type:'long-form',title:'The Forgotten Empire of Gold',complianceScore:9,failed:false},
  {id:'p-002',channel:'CH-01',type:'short',title:'Yamashita Gold — 60 Sec',complianceScore:9,failed:false},
  {id:'p-003',channel:'CH-02',type:'long-form',title:'Exposed After 20 Years',complianceScore:6,failed:true},
  {id:'p-004',channel:'CH-01',type:'long-form',title:"Vatican's Hidden Vault",complianceScore:10,failed:false},
  {id:'p-005',channel:'CH-03',type:'long-form',title:'The Shadow Self Explained',complianceScore:5,failed:true},
];

function pad2(n: number) { return String(n).padStart(2,'0'); }
function addDays(ds: string, n: number) { const d = new Date(ds); d.setDate(d.getDate()+n); return d.toISOString().split('T')[0]; }

function buildCompliance(score: number): Record<string,boolean> {
  const pc = Math.round((score/10)*CHECK_ITEMS.length);
  return Object.fromEntries(CHECK_ITEMS.map((it,i) => [it.id, i < pc]));
}

function buildTags(ch: string): string[] {
  if (ch === 'CH-01') return ['hidden history','untold truth','history mystery','shocking discovery','historical documentary','history channel','educational content','world history','grimm archives','lost treasure','financial scandal','heist story','historical cover up','vault secrets','money mystery','lost fortune','historical conspiracy','wealth secrets','true story documentary','history deep dive'];
  if (ch === 'CH-02') return ['betrayal story','revenge exposed','shocking betrayal','true betrayal','karma story','real revenge','betrayed by family','justice served','relationship advice','emotional intelligence','true story','drama documentary','real life stories','relationship drama','people stories','life advice','trust issues','emotional stories','betrayal aftermath','revenge story'];
  return ['psychology explained','mind tricks','dark psychology','personality types','mental health truth','why people do this','psychology facts','subconscious mind','behavior explained','mind explained','mental health awareness','psychology education','self improvement','personal development','therapy explained','emotional wellness','psychology tips','mindset change','behavior science','mental wellness'];
}

function buildPkg(ch: string, title: string, day: number): UploadPackage {
  return {
    titleA: `The ${title}: The Hidden Truth Nobody Talks About`,
    titleB: `I Found Evidence That Changes The ${title} Story`,
    titleC: `${title} — $2 Billion Vanished in 72 Hours`,
    selectedTitle: `The ${title}: The Hidden Truth Nobody Talks About`,
    descHook: `In 1944, something happened that the world was never meant to know. This is the story of ${title} — and why it's still being covered up today.`,
    descChapters: `0:00 — The Moment Everything Changed\n1:20 — Background You Were Never Taught\n4:10 — The Evidence\n8:30 — What Really Happened\n13:00 — My Take (Why This Still Matters)\n16:00 — What They Don't Want You to Know`,
    descKW: `${title} explained | hidden history | finance mystery | lost treasure | historical cover up | Grimm Archives`,
    descCTA: `🔔 Subscribe for weekly hidden history + finance mysteries nobody else covers.\n▶ Watch next: [RELATED VIDEO LINK]\n\n💬 Drop your theory below — what do YOU think really happened?`,
    descHT: `#GrimmArchives #HiddenHistory #FinanceMystery #TrueStory #HistoryDocumentary`,
    tags: buildTags(ch),
    thumbBg: ['#0D2B2B','#1A3D1A','#2B1A0D','#1A1440'][day % 4],
    thumbTxt: title.toUpperCase().substring(0, 22),
    thumbEmo: 'Mystery/Shock — dark bg, single light source, wide eyes',
    thumbSty: 'Dark atmospheric — dramatic contrast, golden accent, bold text overlay',
    playlist: 'Grimm Archives — Hidden History Series',
    pinnedComment: `🔍 Watch next: [LINK]\n\n💬 What's YOUR theory? Drop it below 👇\n\n🔔 Subscribe for weekly hidden history mysteries`,
    aiDisclosure: true,
  };
}

function genDemo(): Video[] {
  const now = new Date(), yr = now.getFullYear(), mo = now.getMonth(), todN = now.getDate();
  const videos: Video[] = [];
  for (let d = 1; d <= 28; d++) {
    const dow = new Date(yr, mo, d).getDay();
    if (dow === 0) continue;
    const ds = `${yr}-${pad2(mo+1)}-${pad2(d)}`;
    const isPast = d < todN, isTod = d === todN;
    const base = TITLES_CH01[(d-1) % TITLES_CH01.length];
    const score = 7 + (d % 3);
    if (dow === 1 || dow === 3 || dow === 5) {
      const failed = score < 8 && !isPast && !isTod;
      videos.push({
        id: `lf-ch01-${d}`, channel: 'CH-01', type: 'long-form', title: base,
        scheduledDate: ds, scheduledTime: '14:00',
        status: failed ? 'failed' : (isPast || isTod) ? 'live' : 'scheduled',
        complianceScore: score, compliance: buildCompliance(score),
        editorData: { script:'', voice:'', visual:'', ct:'', notes:'', ht:0 },
        uploadPackage: buildPkg('CH-01', base, d),
      });
    }
    if ((dow === 2 || dow === 4) && d <= 20) {
      videos.push({
        id: `sh-ch01-${d}`, channel: 'CH-01', type: 'short', title: `${base} — 60 Sec`,
        scheduledDate: ds, scheduledTime: '10:00',
        status: (isPast || isTod) ? 'live' : 'scheduled',
        complianceScore: 9, compliance: buildCompliance(9),
        editorData: { script:'', voice:'', visual:'', ct:'', notes:'', ht:0 },
        uploadPackage: null,
      });
    }
  }
  const n = new Date();
  [['The Betrayal That Ended Everything', 18], ["When Trust Becomes the Weapon", 25]].forEach(([ttl, d]) => {
    const ds = `${n.getFullYear()}-${pad2(n.getMonth()+1)}-${pad2(Number(d))}`;
    videos.push({
      id: `lf-ch02-${d}`, channel: 'CH-02', type: 'long-form', title: String(ttl),
      scheduledDate: ds, scheduledTime: '15:00', status: 'scheduled',
      complianceScore: 8, compliance: buildCompliance(8),
      editorData: { script:'', voice:'', visual:'', ct:'', notes:'', ht:0 },
      uploadPackage: null,
    });
  });
  return videos;
}

// ── THEME ─────────────────────────────────────────────────────────────

const T = {
  void:'#07050F', deep:'#0E0A1E', panel:'#14102A', card:'#1C1635',
  border:'rgba(140,100,255,0.18)', borderBright:'rgba(140,100,255,0.45)',
  violet:'#7048F8', violetLight:'#9B78FF', lemon:'#E8F400', lemonDim:'rgba(232,244,0,0.12)',
  berry:'#FF3B8C', berryDim:'rgba(255,59,140,0.12)', mint:'#00F5C4', mintDim:'rgba(0,245,196,0.1)',
  text:'#F0EAFF', textMuted:'rgba(200,185,255,0.6)', textDim:'rgba(200,185,255,0.35)',
};
const charger = "'Charger','ChargerExtrabold',sans-serif";
const dropline = "'Dropline',sans-serif";

const STATUS_COLOR: Record<string,string> = { live: T.mint, approved: T.lemon, scheduled: T.violetLight, failed: T.berry, pending: T.textDim };

// ── MAIN COMPONENT ───────────────────────────────────────────────────

export default function CalendarPage() {
  const [videos,  setVideos]  = useState<Video[]>([]);
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [curDate, setCurDate] = useState(new Date());
  const [filter,  setFilter]  = useState('all');
  const [selId,   setSelId]   = useState<string|null>(null);
  const [pkgTab,  setPkgTab]  = useState<'pkg'|'meta'|'thumb'>('pkg');
  const [editor,  setEditor]  = useState<Video|null>(null);
  const [schedModal, setSchedModal] = useState<PendingItem|null>(null);
  const [newSched,   setNewSched]   = useState(false);
  const [schedForm,  setSchedForm]  = useState({ date: '', time: '14:00', channel: 'CH-01', type: 'long-form', title: '' });

  // Load / save
  useEffect(() => {
    const sv = localStorage.getItem('lbx:c4v:vids');
    const sp = localStorage.getItem('lbx:c4v:pend');
    setVideos(sv ? JSON.parse(sv) : genDemo());
    setPending(sp ? JSON.parse(sp) : [...DEMO_PENDING]);
  }, []);

  const save = useCallback((vids: Video[], pend: PendingItem[]) => {
    localStorage.setItem('lbx:c4v:vids', JSON.stringify(vids));
    localStorage.setItem('lbx:c4v:pend', JSON.stringify(pend));
  }, []);

  const updateVideo = (id: string, patch: Partial<Video>) => {
    const next = videos.map(v => v.id === id ? { ...v, ...patch } : v);
    setVideos(next); save(next, pending);
  };

  const updatePkg = (id: string, key: string, val: string) => {
    const next = videos.map(v => v.id === id && v.uploadPackage
      ? { ...v, uploadPackage: { ...v.uploadPackage, [key]: val } } : v);
    setVideos(next); save(next, pending);
  };

  // Calendar helpers
  const yr = curDate.getFullYear(), mo = curDate.getMonth();
  const ms = `${yr}-${pad2(mo+1)}`;
  const today = new Date();
  const monthVids = videos.filter(v => v.scheduledDate.startsWith(ms) && (filter === 'all' || v.channel === filter));
  const byDate: Record<string, Video[]> = {};
  monthVids.forEach(v => { byDate[v.scheduledDate] = byDate[v.scheduledDate] || []; byDate[v.scheduledDate].push(v); });
  const firstDay = new Date(yr, mo, 1).getDay();
  const daysInMonth = new Date(yr, mo+1, 0).getDate();

  const selectedVideo = selId ? videos.find(v => v.id === selId) : null;

  const confirmSchedule = () => {
    if (!schedForm.title || !schedForm.date) return;
    const vid: Video = {
      id: `new-${Date.now()}`, channel: schedForm.channel,
      type: schedForm.type as 'long-form'|'short', title: schedForm.title,
      scheduledDate: schedForm.date, scheduledTime: schedForm.time,
      status: 'scheduled', complianceScore: 8, compliance: buildCompliance(8),
      editorData: { script:'', voice:'', visual:'', ct:'', notes:'', ht:0 },
      uploadPackage: null,
    };
    const next = [...videos, vid];
    setVideos(next); save(next, pending);
    setNewSched(false); setSchedForm({ date:'', time:'14:00', channel:'CH-01', type:'long-form', title:'' });
  };

  const scheduleFromPending = (item: PendingItem) => {
    if (!schedForm.date) return;
    const vid: Video = {
      id: item.id, channel: item.channel, type: item.type as 'long-form'|'short', title: item.title,
      scheduledDate: schedForm.date, scheduledTime: schedForm.time || '14:00',
      status: 'scheduled', complianceScore: item.complianceScore, compliance: buildCompliance(item.complianceScore),
      editorData: { script:'', voice:'', visual:'', ct:'', notes:'', ht:0 }, uploadPackage: null,
    };
    const nextVids = [...videos, vid];
    const nextPend = pending.filter(p => p.id !== item.id);
    setVideos(nextVids); setPending(nextPend); save(nextVids, nextPend); setSchedModal(null);
  };

  // ── RENDER ────────────────────────────────────────────────────────

  const inp: React.CSSProperties = {
    background:'rgba(255,255,255,0.04)', border:`1px solid ${T.border}`,
    borderRadius:6, color:T.text, fontFamily:dropline, fontSize:11, outline:'none', padding:'6px 8px',
  };
  const textArea: React.CSSProperties = { ...inp, resize:'vertical', width:'100%', minHeight:70 };
  const label: React.CSSProperties = { fontSize:9, color:T.textDim, textTransform:'uppercase' as const, letterSpacing:'0.6px', fontFamily:charger, marginBottom:4, display:'block' };
  const secTitle: React.CSSProperties = { fontFamily:charger, fontWeight:700, fontSize:10, textTransform:'uppercase' as const, letterSpacing:'0.08em', color:T.textMuted, marginBottom:10 };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', fontFamily:dropline, color:T.text }}>

      {/* Buffer Bar */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, padding:'12px 24px', background:T.panel, borderBottom:`1px solid ${T.border}` }}>
        {Object.entries(CHANNELS).map(([ch, info]) => {
          const cnt = videos.filter(v => v.channel === ch && v.type === 'long-form' && ['scheduled','approved','live'].includes(v.status)).length;
          const pct = Math.min((cnt/30)*100, 100);
          const low = cnt < 10;
          return (
            <div key={ch} style={{ border:`1px solid ${low ? T.berry+'55' : T.border}`, borderRadius:8, padding:'8px 12px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                <div style={{ fontFamily:charger, fontWeight:700, fontSize:10, textTransform:'uppercase', letterSpacing:'0.06em', color:info.color }}>{ch.replace('-0','-')}</div>
                <div style={{ fontFamily:dropline, fontSize:10, color:low ? T.berry : T.mint }}>{cnt}<span style={{ color:T.textDim }}>/30</span></div>
              </div>
              <div style={{ fontSize:10, color:T.textMuted, marginBottom:5 }}>{info.name}</div>
              <div style={{ height:4, background:'rgba(255,255,255,0.08)', borderRadius:2 }}>
                <div style={{ height:'100%', borderRadius:2, background:info.color, width:`${pct}%`, transition:'width 0.4s' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div style={{ display:'flex', alignItems:'center', gap:16, padding:'10px 24px', background:T.deep, borderBottom:`1px solid ${T.border}`, flexWrap:'wrap' }}>
        {/* Month nav */}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <button onClick={() => setCurDate(new Date(yr, mo-1, 1))} style={{ background:'transparent', border:`1px solid ${T.border}`, color:T.textMuted, borderRadius:6, width:28, height:28, cursor:'pointer', fontSize:14 }}>‹</button>
          <div style={{ fontFamily:charger, fontWeight:700, fontSize:13, textTransform:'uppercase', letterSpacing:'0.06em', minWidth:160, textAlign:'center' }}>{MONTHS[mo]} {yr}</div>
          <button onClick={() => setCurDate(new Date(yr, mo+1, 1))} style={{ background:'transparent', border:`1px solid ${T.border}`, color:T.textMuted, borderRadius:6, width:28, height:28, cursor:'pointer', fontSize:14 }}>›</button>
          <button onClick={() => setCurDate(new Date())} style={{ fontFamily:charger, fontWeight:700, fontSize:9, textTransform:'uppercase', letterSpacing:'0.06em', background:'transparent', border:`1px solid ${T.border}`, color:T.textMuted, borderRadius:6, padding:'4px 10px', cursor:'pointer' }}>Today</button>
        </div>

        {/* Stats */}
        <div style={{ display:'flex', gap:12, flex:1 }}>
          {[['Live', T.mint, monthVids.filter(v=>v.status==='live').length],
            ['Sched', T.lemon, monthVids.filter(v=>v.status==='scheduled').length],
            ['Appr', T.violetLight, monthVids.filter(v=>v.status==='approved').length],
            ['Fail', T.berry, monthVids.filter(v=>v.status==='failed').length],
            ['Shorts', T.textMuted, monthVids.filter(v=>v.type==='short').length],
          ].map(([lbl, color, cnt]) => (
            <div key={String(lbl)} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:String(color) }} />
              <span style={{ color:T.textDim }}>{lbl}:</span>
              <strong style={{ color:String(color) }}>{String(cnt)}</strong>
            </div>
          ))}
        </div>

        {/* Channel filter */}
        <div style={{ display:'flex', gap:4 }}>
          {['all','CH-01','CH-02','CH-03','CH-04'].map(ch => (
            <button key={ch} onClick={() => setFilter(ch)}
              style={{ fontFamily:charger, fontWeight:700, fontSize:9, textTransform:'uppercase', letterSpacing:'0.06em', padding:'4px 10px', background: filter===ch ? T.violet+'33' : 'transparent', border:`1px solid ${filter===ch ? T.violet : T.border}`, color: filter===ch ? T.violetLight : T.textMuted, borderRadius:6, cursor:'pointer' }}>
              {ch === 'all' ? 'All' : ch.replace('-0','-')}
            </button>
          ))}
        </div>

        <button onClick={() => setNewSched(true)}
          style={{ fontFamily:charger, fontWeight:700, fontSize:10, textTransform:'uppercase', letterSpacing:'0.06em', padding:'6px 14px', background: T.violet, border:'none', color:'#fff', borderRadius:8, cursor:'pointer' }}>
          + Schedule
        </button>
      </div>

      {/* Main 3-column layout */}
      <div style={{ display:'grid', gridTemplateColumns:'220px 1fr 280px', flex:1, overflow:'hidden' }}>

        {/* Inbox Panel */}
        <div style={{ borderRight:`1px solid ${T.border}`, display:'flex', flexDirection:'column', overflow:'hidden', background:T.panel }}>
          <div style={{ padding:'12px 14px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontFamily:charger, fontWeight:700, fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em', color:T.textMuted }}>Pending Review</span>
            <span style={{ background:T.berry+'22', border:`1px solid ${T.berry}44`, color:T.berry, fontSize:10, fontFamily:dropline, padding:'2px 7px', borderRadius:10 }}>{pending.length}</span>
          </div>
          <div style={{ flex:1, overflowY:'auto', padding:8 }}>
            {pending.length === 0 ? (
              <div style={{ textAlign:'center', padding:'20px 10px', color:T.textDim, fontSize:11 }}>✅ Queue clear</div>
            ) : pending.map(item => {
              const ch = CHANNELS[item.channel];
              const fail = item.failed || item.complianceScore < 7;
              return (
                <div key={item.id} style={{ background:T.card, border:`1px solid ${fail ? T.berry+'33' : T.border}`, borderRadius:8, marginBottom:8, overflow:'hidden' }}>
                  <div style={{ height:3, background:ch.color }} />
                  <div style={{ padding:'8px 10px' }}>
                    <div style={{ fontSize:9, color:ch.color, fontFamily:charger, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>{item.channel} — {ch.name}</div>
                    <div style={{ fontSize:11, fontFamily:charger, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:6, lineHeight:1.3 }}>{item.title}</div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ fontSize:9, padding:'2px 6px', borderRadius:4, background: item.type==='long-form' ? T.violet+'22' : T.mint+'22', color: item.type==='long-form' ? T.violetLight : T.mint, fontFamily:charger, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em' }}>{item.type==='long-form'?'▶ Long':'⚡ Short'}</span>
                      <span style={{ fontSize:10, color: fail ? T.berry : T.mint, fontFamily:dropline }}>{item.complianceScore}/10 {fail?'⚠️':'✓'}</span>
                    </div>
                    <div style={{ display:'flex', gap:5 }}>
                      {fail
                        ? <button onClick={() => { const v: Video = { id:item.id, channel:item.channel, type:item.type as 'long-form'|'short', title:item.title, scheduledDate:'', scheduledTime:'', status:'failed', complianceScore:item.complianceScore, compliance:buildCompliance(item.complianceScore), editorData:{script:'',voice:'',visual:'',ct:'',notes:'',ht:0}, uploadPackage:null }; setEditor(v); }}
                            style={{ flex:1, fontFamily:charger, fontWeight:700, fontSize:9, textTransform:'uppercase', letterSpacing:'0.04em', padding:'5px', background:T.berry+'22', border:`1px solid ${T.berry}44`, color:T.berry, borderRadius:5, cursor:'pointer' }}>✏️ Fix</button>
                        : <button onClick={() => { setSchedModal(item); setSchedForm(p => ({...p, date:''})); }}
                            style={{ flex:1, fontFamily:charger, fontWeight:700, fontSize:9, textTransform:'uppercase', letterSpacing:'0.04em', padding:'5px', background:T.mint+'22', border:`1px solid ${T.mint}44`, color:T.mint, borderRadius:5, cursor:'pointer' }}>Schedule →</button>
                      }
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calendar Grid */}
        <div style={{ overflowY:'auto', padding:'16px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, marginBottom:4 }}>
            {DAYS.map(d => (
              <div key={d} style={{ fontFamily:charger, fontWeight:700, fontSize:9, textTransform:'uppercase', letterSpacing:'0.08em', color:T.textDim, textAlign:'center', padding:'4px 0' }}>{d}</div>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
            {Array.from({length:firstDay}).map((_,i) => <div key={`e${i}`} />)}
            {Array.from({length:daysInMonth}).map((_,i) => {
              const d = i+1;
              const ds = `${yr}-${pad2(mo+1)}-${pad2(d)}`;
              const dvs = byDate[ds] || [];
              const isTod = new Date(yr,mo,d).toDateString() === today.toDateString();
              return (
                <div key={d} style={{ background:isTod ? 'rgba(112,72,248,0.1)' : T.card, border:`1px solid ${isTod ? T.violet+'55' : T.border}`, borderRadius:8, padding:'6px 6px 5px', minHeight:80 }}>
                  <div style={{ fontFamily:dropline, fontSize:10, letterSpacing:'0.06em', color:isTod ? T.lemon : T.textDim, textAlign:'right', marginBottom:4 }}>{d}</div>
                  {dvs.slice(0,3).map(v => {
                    const ch = CHANNELS[v.channel];
                    const isFail = v.status === 'failed';
                    const isSel = selId === v.id;
                    return (
                      <div key={v.id} onClick={() => setSelId(isSel ? null : v.id)}
                        style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 5px', borderRadius:4, marginBottom:2, cursor:'pointer', background: isSel ? T.violet+'33' : isFail ? T.berry+'15' : 'rgba(255,255,255,0.04)', border:`1px solid ${isSel ? T.violet+'55' : isFail ? T.berry+'33' : 'transparent'}` }}>
                        <div style={{ width:5, height:5, borderRadius:'50%', background:ch.color, flexShrink:0 }} />
                        <div style={{ fontSize:9, color:isFail ? T.berry : T.text, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis', flex:1, fontFamily:charger, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.03em' }}>{v.title}</div>
                        <div style={{ width:5, height:5, borderRadius:'50%', background:STATUS_COLOR[v.status]||T.textDim, flexShrink:0 }} />
                      </div>
                    );
                  })}
                  {dvs.length > 3 && <div style={{ fontSize:9, color:T.textDim, fontFamily:dropline, textAlign:'right', marginTop:2 }}>+{dvs.length-3}</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upload Package Panel */}
        <div style={{ borderLeft:`1px solid ${T.border}`, display:'flex', flexDirection:'column', overflow:'hidden', background:T.panel }}>
          {!selectedVideo ? (
            <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, textAlign:'center' }}>
              <div style={{ fontSize:32, marginBottom:12 }}>📦</div>
              <div style={{ fontFamily:charger, fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', color:T.textMuted, marginBottom:8 }}>Upload Package</div>
              <div style={{ fontSize:11, color:T.textDim, lineHeight:1.5 }}>Click any video in the calendar to open its SEO upload package</div>
            </div>
          ) : (
            <>
              <div style={{ padding:'12px 14px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
                <div>
                  <div style={{ fontSize:9, color:CHANNELS[selectedVideo.channel].color, fontFamily:charger, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>{selectedVideo.channel} · {selectedVideo.type==='long-form'?'▶ Long-Form':'⚡ Short'}</div>
                  <div style={{ fontFamily:charger, fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:'0.04em', lineHeight:1.3 }}>{selectedVideo.title}</div>
                </div>
                <button onClick={() => setSelId(null)} style={{ background:'transparent', border:`1px solid ${T.border}`, color:T.textMuted, borderRadius:5, width:24, height:24, cursor:'pointer', fontSize:12, flexShrink:0 }}>✕</button>
              </div>

              {/* Status row */}
              <div style={{ padding:'8px 14px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', gap:8 }}>
                <select style={{ ...inp, flex:1 }} value={selectedVideo.status}
                  onChange={e => updateVideo(selectedVideo.id, { status: e.target.value as Video['status'] })}>
                  {['pending','failed','approved','scheduled','live'].map(s => <option key={s}>{s}</option>)}
                </select>
                <div style={{ fontFamily:dropline, fontSize:12, letterSpacing:'0.08em', color:STATUS_COLOR[selectedVideo.status]||T.textDim, fontWeight:700 }}>{selectedVideo.complianceScore}/10</div>
                {selectedVideo.status === 'failed' && (
                  <button onClick={() => setEditor({...selectedVideo})}
                    style={{ fontFamily:charger, fontWeight:700, fontSize:9, textTransform:'uppercase', letterSpacing:'0.04em', padding:'4px 8px', background:T.berry+'22', border:`1px solid ${T.berry}44`, color:T.berry, borderRadius:5, cursor:'pointer' }}>Edit</button>
                )}
              </div>

              {/* Pkg tabs */}
              <div style={{ display:'flex', borderBottom:`1px solid ${T.border}` }}>
                {(['pkg','meta','thumb'] as const).map(t => (
                  <button key={t} onClick={() => setPkgTab(t)}
                    style={{ flex:1, fontFamily:charger, fontWeight:700, fontSize:9, textTransform:'uppercase', letterSpacing:'0.06em', padding:'10px 4px', background:'transparent', border:'none', borderBottom: pkgTab===t ? `2px solid ${T.lemon}` : '2px solid transparent', color: pkgTab===t ? T.lemon : T.textMuted, cursor:'pointer' }}>
                    {t==='pkg'?'📦 Package':t==='meta'?'⚙️ Meta':'🖼️ Thumb'}
                  </button>
                ))}
              </div>

              <div style={{ flex:1, overflowY:'auto', padding:'12px 14px' }}>
                {pkgTab === 'pkg' && selectedVideo.uploadPackage && (
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    <div>
                      <span style={secTitle}>SEO Titles — Select One</span>
                      {(['titleA','titleB','titleC'] as const).map((key, i) => {
                        const labels = ['Curiosity','Fear · Loss','Number · Result'];
                        const colors = [T.violetLight, T.berry, T.mint];
                        const pkg = selectedVideo.uploadPackage!;
                        return (
                          <div key={key} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:7, padding:'8px 10px', marginBottom:6 }}>
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                              <span style={{ fontSize:9, color:colors[i], fontFamily:charger, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em' }}>{String.fromCharCode(65+i)} — {labels[i]}</span>
                              <button onClick={() => updatePkg(selectedVideo.id, 'selectedTitle', pkg[key])}
                                style={{ fontSize:9, padding:'2px 8px', borderRadius:4, cursor:'pointer', background: pkg.selectedTitle===pkg[key] ? T.mint+'22' : 'transparent', border:`1px solid ${pkg.selectedTitle===pkg[key] ? T.mint : T.border}`, color: pkg.selectedTitle===pkg[key] ? T.mint : T.textDim }}>
                                {pkg.selectedTitle===pkg[key] ? '✓ Selected' : 'Pick'}
                              </button>
                            </div>
                            <textarea style={{ ...textArea, minHeight:44, fontSize:10 }} value={pkg[key]}
                              onChange={e => updatePkg(selectedVideo.id, key, e.target.value)} />
                          </div>
                        );
                      })}
                    </div>
                    <div>
                      <span style={label}>Final Upload Title</span>
                      <input style={{ ...inp, width:'100%' }} value={selectedVideo.uploadPackage.selectedTitle}
                        onChange={e => updatePkg(selectedVideo.id, 'selectedTitle', e.target.value)} />
                    </div>
                    {[
                      {key:'descHook',lbl:'🎯 Hook (First 2 lines)'},
                      {key:'descChapters',lbl:'📋 Chapters'},
                      {key:'descKW',lbl:'🔑 Keyword Paragraph'},
                      {key:'descCTA',lbl:'📣 CTA Block'},
                      {key:'descHT',lbl:'#️⃣ Hashtags'},
                    ].map(({key,lbl}) => (
                      <div key={key}>
                        <span style={label}>{lbl}</span>
                        <textarea style={{ ...textArea, marginBottom:8, fontSize:10 }}
                          value={(selectedVideo.uploadPackage as Record<string,string>)[key] || ''}
                          onChange={e => updatePkg(selectedVideo.id, key, e.target.value)} />
                      </div>
                    ))}
                  </div>
                )}

                {pkgTab === 'meta' && selectedVideo.uploadPackage && (
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    <div>
                      <span style={secTitle}>Tags — {selectedVideo.uploadPackage.tags.length}/20</span>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                        {selectedVideo.uploadPackage.tags.map((tag,i) => (
                          <span key={i} style={{ fontSize:9, padding:'3px 8px', background:T.card, border:`1px solid ${T.border}`, borderRadius:10, color:T.textMuted, fontFamily:dropline }}>{tag}</span>
                        ))}
                      </div>
                    </div>
                    {[
                      {key:'playlist',lbl:'Playlist'},
                      {key:'pinnedComment',lbl:'Pinned Comment',rows:3},
                    ].map(({key,lbl,rows}) => (
                      <div key={key}>
                        <span style={label}>{lbl}</span>
                        {rows
                          ? <textarea style={{ ...textArea, minHeight:60, fontSize:10 }} value={(selectedVideo.uploadPackage as Record<string,string>)[key]||''}
                              onChange={e => updatePkg(selectedVideo.id, key, e.target.value)} />
                          : <input style={{ ...inp, width:'100%' }} value={(selectedVideo.uploadPackage as Record<string,string>)[key]||''}
                              onChange={e => updatePkg(selectedVideo.id, key, e.target.value)} />
                        }
                      </div>
                    ))}
                    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', background:T.card, border:`1px solid ${T.border}`, borderRadius:8 }}>
                      <span style={{ fontSize:11, flex:1 }}>AI Disclosure</span>
                      <div onClick={() => updatePkg(selectedVideo.id, 'aiDisclosure', String(!selectedVideo.uploadPackage!.aiDisclosure))}
                        style={{ width:34, height:18, borderRadius:9, background: selectedVideo.uploadPackage.aiDisclosure ? T.mint : T.border, cursor:'pointer', position:'relative', transition:'background 0.2s' }}>
                        <div style={{ position:'absolute', top:2, left: selectedVideo.uploadPackage.aiDisclosure ? 18 : 2, width:14, height:14, borderRadius:'50%', background:'#fff', transition:'left 0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}

                {pkgTab === 'thumb' && selectedVideo.uploadPackage && (
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    <div style={{ background:selectedVideo.uploadPackage.thumbBg, borderRadius:8, padding:'16px', textAlign:'center', marginBottom:4 }}>
                      <div style={{ fontFamily:charger, fontWeight:800, fontSize:14, textTransform:'uppercase', letterSpacing:'0.04em', color:'#fff', textShadow:'0 2px 8px rgba(0,0,0,0.8)' }}>{selectedVideo.uploadPackage.thumbTxt}</div>
                    </div>
                    {[
                      {key:'thumbEmo',lbl:'Emotion Direction'},
                      {key:'thumbSty',lbl:'Visual Style'},
                    ].map(({key,lbl}) => (
                      <div key={key}>
                        <span style={label}>{lbl}</span>
                        <textarea style={{ ...textArea, minHeight:50, fontSize:10 }}
                          value={(selectedVideo.uploadPackage as Record<string,string>)[key]||''}
                          onChange={e => updatePkg(selectedVideo.id, key, e.target.value)} />
                      </div>
                    ))}
                    <div>
                      <span style={label}>BG Color</span>
                      <input type="color" value={selectedVideo.uploadPackage.thumbBg}
                        onChange={e => updatePkg(selectedVideo.id, 'thumbBg', e.target.value)}
                        style={{ width:'100%', height:32, borderRadius:6, border:`1px solid ${T.border}`, cursor:'pointer', background:'transparent' }} />
                    </div>
                  </div>
                )}

                {!selectedVideo.uploadPackage && (
                  <div style={{ textAlign:'center', padding:'20px 10px' }}>
                    <div style={{ fontSize:28, marginBottom:8 }}>📝</div>
                    <div style={{ fontFamily:charger, fontWeight:700, fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em', color:T.textMuted, marginBottom:6 }}>No Upload Package</div>
                    <button onClick={() => { const pkg = buildPkg(selectedVideo.channel, selectedVideo.title, 0); updateVideo(selectedVideo.id, { uploadPackage: pkg }); }}
                      style={{ fontFamily:charger, fontWeight:700, fontSize:10, textTransform:'uppercase', letterSpacing:'0.06em', padding:'8px 16px', background:T.violet, border:'none', color:'#fff', borderRadius:8, cursor:'pointer' }}>
                      Build Package
                    </button>
                  </div>
                )}
              </div>

              {selectedVideo.uploadPackage && (
                <div style={{ padding:'10px 14px', borderTop:`1px solid ${T.border}`, display:'flex', gap:6 }}>
                  <button onClick={() => {
                    const p = selectedVideo.uploadPackage!;
                    const txt = `TITLE: ${p.selectedTitle}\n\nDESCRIPTION:\n${p.descHook}\n\n${p.descChapters}\n\n${p.descKW}\n\n${p.descCTA}\n\n${p.descHT}\n\nTAGS: ${p.tags.join(', ')}`;
                    navigator.clipboard.writeText(txt);
                  }} style={{ flex:1, fontFamily:charger, fontWeight:700, fontSize:9, textTransform:'uppercase', letterSpacing:'0.04em', padding:'7px', background:T.violet+'22', border:`1px solid ${T.violet}44`, color:T.violetLight, borderRadius:6, cursor:'pointer' }}>📋 Copy All</button>
                  {selectedVideo.status !== 'live' && (
                    <button onClick={() => updateVideo(selectedVideo.id, { status:'approved' })}
                      style={{ flex:1, fontFamily:charger, fontWeight:700, fontSize:9, textTransform:'uppercase', letterSpacing:'0.04em', padding:'7px', background:T.mint+'22', border:`1px solid ${T.mint}44`, color:T.mint, borderRadius:6, cursor:'pointer' }}>✓ Approve</button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Human Touch Editor Drawer */}
      {editor && (
        <div style={{ position:'fixed', inset:0, background:'rgba(7,5,15,0.85)', zIndex:200, display:'flex', justifyContent:'flex-end' }}>
          <div style={{ width:'90%', maxWidth:1100, background:T.deep, borderLeft:`1px solid ${T.border}`, display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
            {/* Drawer header */}
            <div style={{ padding:'16px 24px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontFamily:charger, fontWeight:800, fontSize:14, textTransform:'uppercase', letterSpacing:'0.04em' }}>🎨 Human Touch Editor</div>
                <div style={{ fontSize:11, color:T.textMuted, marginTop:3 }}>{editor.title} — Review · Rewrite · Fix Compliance</div>
              </div>
              <button onClick={() => setEditor(null)} style={{ fontFamily:charger, fontWeight:700, fontSize:10, textTransform:'uppercase', letterSpacing:'0.04em', padding:'6px 14px', background:T.berry+'22', border:`1px solid ${T.berry}44`, color:T.berry, borderRadius:6, cursor:'pointer' }}>✕ Close</button>
            </div>

            {/* Drawer body */}
            <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 320px', overflow:'hidden' }}>
              {/* Left: text zones */}
              <div style={{ padding:'20px 24px', overflowY:'auto', display:'flex', flexDirection:'column', gap:14 }}>
                {[
                  {key:'script',lbl:'Script — Human Rewrite Zone',ph:'Paste the AI script here. Rewrite any lines that sound robotic, generic, or like a Wikipedia summary. Target: 30%+ rewrite.\n\nFocus on:\n• The hook — make it yours\n• The reveal moment\n• Your Creator Take at the end',rows:10},
                  {key:'voice',lbl:'Voiceover Direction Notes',ph:'ElevenLabs/SSML direction:\n• [0:00] DRAMATIC — slow, dark, menacing\n• [0:45] WHISPER — this is the conspiracy reveal\n• [2:00] ANGRY — heat up here, don\'t hold back',rows:4},
                  {key:'visual',lbl:'Visual Direction Overrides',ph:'Override the auto-generated visual cues:\n• [0:00–0:10] HUNYUAN CLIP — heavy vault door, slow dramatic open\n• [1:20] WHISK — close-up of gold coins falling',rows:4},
                  {key:'ct',lbl:'Creator Take — Your Original Analysis',ph:'Write your unique theory, opinion, or angle here. This is what separates you from every AI-slop channel covering the same story.',rows:3},
                ].map(({key,lbl,ph,rows}) => (
                  <div key={key}>
                    <div style={{ ...secTitle, color:T.violetLight, display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:4, height:12, background:T.lemon, borderRadius:2 }} />{lbl}
                      {key==='script' && <span style={{ fontSize:9, color:T.mint, marginLeft:'auto' }}>Words: {editor.editorData.script.split(/\s+/).filter(Boolean).length}</span>}
                    </div>
                    <textarea rows={rows}
                      style={{ ...textArea, minHeight: rows*20 }}
                      placeholder={ph}
                      value={(editor.editorData as Record<string,string|number>)[key] as string}
                      onChange={e => setEditor(prev => prev ? { ...prev, editorData: { ...prev.editorData, [key]: e.target.value, ht: key==='script' ? Math.min(100, Math.round((e.target.value.length / Math.max(prev.editorData.script.length||200,200))*100)) : prev.editorData.ht } } : null)}
                    />
                  </div>
                ))}
                <div>
                  <span style={secTitle}>📝 Editor Notes</span>
                  <textarea rows={3} style={textArea} placeholder="Personal notes..."
                    value={editor.editorData.notes}
                    onChange={e => setEditor(prev => prev ? { ...prev, editorData: { ...prev.editorData, notes: e.target.value } } : null)} />
                </div>
              </div>

              {/* Right: checklist + HT meter */}
              <div style={{ padding:'20px 16px', borderLeft:`1px solid ${T.border}`, overflowY:'auto', display:'flex', flexDirection:'column', gap:14, background:T.panel }}>
                <div>
                  <span style={secTitle}>Compliance Checklist</span>
                  <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                    {CHECK_ITEMS.map(item => {
                      const checked = !!editor.compliance[item.id];
                      return (
                        <div key={item.id} onClick={() => setEditor(prev => prev ? { ...prev, compliance: { ...prev.compliance, [item.id]: !checked }, complianceScore: Math.round(Object.values({...prev.compliance,[item.id]:!checked}).filter(Boolean).length/CHECK_ITEMS.length*10) } : null)}
                          style={{ display:'flex', gap:8, padding:'6px 8px', background: checked ? 'rgba(0,245,196,0.05)' : T.card, border:`1px solid ${checked ? T.mint+'33' : T.border}`, borderRadius:6, cursor:'pointer' }}>
                          <div style={{ width:14, height:14, borderRadius:3, border:`1.5px solid ${checked ? T.mint : T.borderBright}`, background: checked ? T.mint : 'transparent', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', marginTop:1 }}>
                            {checked && <span style={{ fontSize:9, color:'#000', fontWeight:700 }}>✓</span>}
                          </div>
                          <span style={{ fontSize:10, lineHeight:1.4, color:checked ? T.textMuted : T.text, textDecoration:checked?'line-through':'none' }}>{item.t}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* HT Meter */}
                <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:'12px 14px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                    <span style={{ fontFamily:charger, fontWeight:700, fontSize:10, textTransform:'uppercase', letterSpacing:'0.06em', color:T.textMuted }}>Human Touch %</span>
                    <span style={{ fontFamily:dropline, fontSize:16, letterSpacing:'0.08em', fontWeight:700, color: editor.editorData.ht >= 30 ? T.mint : editor.editorData.ht >= 15 ? T.lemon : T.berry }}>{editor.editorData.ht}%</span>
                  </div>
                  <div style={{ height:6, background:'rgba(255,255,255,0.08)', borderRadius:3, marginBottom:8 }}>
                    <div style={{ height:'100%', borderRadius:3, width:`${editor.editorData.ht}%`, background: editor.editorData.ht >= 30 ? T.mint : editor.editorData.ht >= 15 ? T.lemon : T.berry, transition:'width 0.3s' }} />
                  </div>
                  <div style={{ fontSize:10, color:T.textMuted, lineHeight:1.4 }}>
                    {editor.editorData.ht >= 30 ? '✅ Passes YouTube authenticity check' : 'Write 30%+ to pass YouTube\'s authenticity check.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer footer */}
            <div style={{ padding:'12px 24px', borderTop:`1px solid ${T.border}`, display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button onClick={() => setEditor(null)}
                style={{ fontFamily:charger, fontWeight:700, fontSize:10, textTransform:'uppercase', letterSpacing:'0.06em', padding:'8px 20px', background:'transparent', border:`1px solid ${T.border}`, color:T.textMuted, borderRadius:8, cursor:'pointer' }}>Discard</button>
              <button onClick={() => {
                const updated = { ...editor, status: 'approved' as Video['status'] };
                const nextVids = videos.map(v => v.id === editor.id ? updated : v);
                const newVid = videos.find(v => v.id === editor.id) ? null : updated;
                const finalVids = newVid ? [...nextVids, updated] : nextVids;
                const nextPend = pending.filter(p => p.id !== editor.id);
                setVideos(finalVids); setPending(nextPend); save(finalVids, nextPend); setEditor(null);
              }} style={{ fontFamily:charger, fontWeight:700, fontSize:10, textTransform:'uppercase', letterSpacing:'0.06em', padding:'8px 20px', background:T.mint, border:'none', color:'#000', borderRadius:8, cursor:'pointer' }}>✓ Approve & Schedule</button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal (from pending) */}
      {schedModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(7,5,15,0.85)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:T.panel, border:`1px solid ${T.border}`, borderRadius:16, padding:'28px 32px', width:400 }}>
            <div style={{ fontFamily:charger, fontWeight:800, fontSize:14, textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:20 }}>Schedule Content</div>
            {[
              {lbl:'Date', el:<input type="date" style={{ ...inp, width:'100%' }} value={schedForm.date} onChange={e => setSchedForm(p=>({...p,date:e.target.value}))} />},
              {lbl:'Upload Time', el:<input type="time" style={{ ...inp, width:'100%' }} value={schedForm.time} onChange={e => setSchedForm(p=>({...p,time:e.target.value}))} />},
            ].map(({lbl,el}) => (
              <div key={lbl} style={{ marginBottom:14 }}>
                <span style={label}>{lbl}</span>
                {el}
              </div>
            ))}
            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button onClick={() => setSchedModal(null)} style={{ flex:1, fontFamily:charger, fontWeight:700, fontSize:10, textTransform:'uppercase', letterSpacing:'0.06em', padding:'10px', background:'transparent', border:`1px solid ${T.border}`, color:T.textMuted, borderRadius:8, cursor:'pointer' }}>Cancel</button>
              <button onClick={() => scheduleFromPending(schedModal)} style={{ flex:1, fontFamily:charger, fontWeight:700, fontSize:10, textTransform:'uppercase', letterSpacing:'0.06em', padding:'10px', background:T.violet, border:'none', color:'#fff', borderRadius:8, cursor:'pointer' }}>Schedule →</button>
            </div>
          </div>
        </div>
      )}

      {/* New Schedule Modal */}
      {newSched && (
        <div style={{ position:'fixed', inset:0, background:'rgba(7,5,15,0.85)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:T.panel, border:`1px solid ${T.border}`, borderRadius:16, padding:'28px 32px', width:420 }}>
            <div style={{ fontFamily:charger, fontWeight:800, fontSize:14, textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:20 }}>Schedule Content</div>
            {[
              {lbl:'Date', el:<input type="date" style={{ ...inp, width:'100%' }} value={schedForm.date} onChange={e => setSchedForm(p=>({...p,date:e.target.value}))} />},
              {lbl:'Upload Time', el:<input type="time" style={{ ...inp, width:'100%' }} value={schedForm.time} onChange={e => setSchedForm(p=>({...p,time:e.target.value}))} />},
              {lbl:'Channel', el:<select style={{ ...inp, width:'100%' }} value={schedForm.channel} onChange={e => setSchedForm(p=>({...p,channel:e.target.value}))}>
                {Object.entries(CHANNELS).map(([k,v]) => <option key={k} value={k}>{k} — {v.name}</option>)}
              </select>},
              {lbl:'Type', el:<select style={{ ...inp, width:'100%' }} value={schedForm.type} onChange={e => setSchedForm(p=>({...p,type:e.target.value}))}>
                <option value="long-form">Long-Form Video</option>
                <option value="short">YouTube Short</option>
              </select>},
              {lbl:'Working Title', el:<input style={{ ...inp, width:'100%' }} placeholder="Video title..." value={schedForm.title} onChange={e => setSchedForm(p=>({...p,title:e.target.value}))} />},
            ].map(({lbl,el}) => (
              <div key={lbl} style={{ marginBottom:14 }}>
                <span style={label}>{lbl}</span>
                {el}
              </div>
            ))}
            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button onClick={() => setNewSched(false)} style={{ flex:1, fontFamily:charger, fontWeight:700, fontSize:10, textTransform:'uppercase', letterSpacing:'0.06em', padding:'10px', background:'transparent', border:`1px solid ${T.border}`, color:T.textMuted, borderRadius:8, cursor:'pointer' }}>Cancel</button>
              <button onClick={confirmSchedule} style={{ flex:1, fontFamily:charger, fontWeight:700, fontSize:10, textTransform:'uppercase', letterSpacing:'0.06em', padding:'10px', background:T.violet, border:'none', color:'#fff', borderRadius:8, cursor:'pointer' }}>Schedule →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
