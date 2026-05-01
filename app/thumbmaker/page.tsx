'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

const CW = 1280, CH = 720;

const T = {
  void:'#07050F', deep:'#0E0A1E', panel:'#14102A', card:'#1C1635',
  border:'rgba(140,100,255,0.18)', borderBright:'rgba(140,100,255,0.45)',
  violet:'#7048F8', violetLight:'#9B78FF', lemon:'#E8F400', lemonDim:'rgba(232,244,0,0.12)',
  berry:'#FF3B8C', mint:'#00F5C4', text:'#F0EAFF',
  textMuted:'rgba(200,185,255,0.6)', textDim:'rgba(200,185,255,0.35)',
};
const charger = "'Charger','ChargerExtrabold',sans-serif";
const dropline = "'Dropline',sans-serif";

const CH_PALETTES: Record<string, { bg: string[]; accent: string; label: string; gradFrom: string; gradTo: string }> = {
  'CH-01': { bg:['#0D2B2B','#1A3D1A','#2B1A0D','#1A1440','#0D1A2B','#1A0A0A','#0A1A1A','#201840'], accent:'#00D4AA', label:'GRIMM ARCHIVES', gradFrom:'#0D2B2B', gradTo:'#1A1040' },
  'CH-02': { bg:['#2B0D1A','#2B1A0D','#1A0D2B','#2B1A1A','#0D0D0D','#200D10','#2B0808','#1A1020'], accent:'#FF3B8C', label:'BETRAYAL & REVENGE', gradFrom:'#2B0D1A', gradTo:'#1A1040' },
  'CH-03': { bg:['#1A1040','#0D1A2B','#1A0D2B','#0D2020','#1A1220','#0A0A1A','#10101A','#181030'], accent:'#9B78FF', label:'JUNGIAN PSYCHOLOGY', gradFrom:'#1A1040', gradTo:'#0D1A2B' },
  'CH-04': { bg:['#0D1A2B','#0D2B2B','#0D0D2B','#1A1A2B','#0A1A20','#0A0A1A','#101830','#0D1A20'], accent:'#4FC3F7', label:'SLEEP SOUNDSCAPES', gradFrom:'#0D1A2B', gradTo:'#0D0D2B' },
};

const TEXT_SWATCHES = ['#FFFFFF','#FFFF00','#E8F400','#00F5C4','#FF3B8C','#9B78FF','#4FC3F7','#FFB347','#FF6B6B','#A8FF3E'];
const POS_PRESETS = [
  {label:'↖',x:.05,y:.2},{label:'↑',x:.5,y:.2},{label:'↗',x:.95,y:.2},
  {label:'←',x:.05,y:.5},{label:'·',x:.5,y:.5},{label:'→',x:.95,y:.5},
  {label:'↙',x:.05,y:.82},{label:'↓',x:.5,y:.82},{label:'↘',x:.95,y:.82},
];

interface ThumbState {
  channel: string;
  bg: { type: 'solid'|'gradient'|'image'; color: string; gradFrom: string; gradTo: string; gradDir: string };
  overlay: { vignette: number; grain: boolean; tint: boolean; tintColor: string; tintAmt: number };
  accent: { type: 'none'|'bar'|'box'|'corner'; color: string; opacity: number };
  headline: { text: string; size: number; font: string; color: string; align: 'left'|'center'|'right'; shadow: boolean; stroke: boolean; strokeColor: string; strokeW: number; glow: boolean; glowColor: string; posX: number; posY: number };
  sub: { text: string; color: string; bgColor: string; visible: boolean };
}

const DEFAULT_STATE = (ch = 'CH-01'): ThumbState => ({
  channel: ch,
  bg: { type:'solid', color: CH_PALETTES[ch].bg[0], gradFrom: CH_PALETTES[ch].gradFrom, gradTo: CH_PALETTES[ch].gradTo, gradDir:'to bottom right' },
  overlay: { vignette:.65, grain:true, tint:false, tintColor:'#00F5C4', tintAmt:.12 },
  accent: { type:'none', color: CH_PALETTES[ch].accent, opacity:.8 },
  headline: { text:'', size:110, font:'Impact', color:'#FFFFFF', align:'left', shadow:true, stroke:false, strokeColor:'#000000', strokeW:4, glow:false, glowColor: CH_PALETTES[ch].accent, posX:.08, posY:.78 },
  sub: { text: CH_PALETTES[ch].label, color: CH_PALETTES[ch].accent, bgColor:'#000000', visible:false },
});

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

export default function ThumbmakerPage() {
  const [variant, setVariant] = useState<'A'|'B'|'C'>('A');
  const [states, setStates] = useState<Record<string, ThumbState>>({ A: DEFAULT_STATE(), B: DEFAULT_STATE(), C: DEFAULT_STATE() });
  const [bgImages, setBgImages] = useState<Record<string, HTMLImageElement|null>>({ A:null, B:null, C:null });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevRef   = useRef<HTMLCanvasElement>(null);

  const s = states[variant];
  const setS = (patch: Partial<ThumbState> | ((prev: ThumbState) => ThumbState)) => {
    setStates(prev => ({ ...prev, [variant]: typeof patch === 'function' ? patch(prev[variant]) : { ...prev[variant], ...patch } }));
  };

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, CW, CH);

    // Background
    const st = states[variant];
    if (st.bg.type === 'image' && bgImages[variant]) {
      const img = bgImages[variant]!;
      const sr = img.width / img.height, cr = CW / CH;
      let sw, sh, sx, sy;
      if (sr > cr) { sh = img.height; sw = sh * cr; sy = 0; sx = (img.width - sw) / 2; }
      else { sw = img.width; sh = sw / cr; sx = 0; sy = (img.height - sh) / 2; }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, CW, CH);
    } else if (st.bg.type === 'gradient') {
      const dirs: Record<string,[number,number,number,number]> = {
        'to bottom right': [0,0,CW,CH], 'to right': [0,CH/2,CW,CH/2],
        'to bottom': [CW/2,0,CW/2,CH], 'to top right': [0,CH,CW,0],
      };
      const d = dirs[st.bg.gradDir] || [0,0,CW,CH];
      const g = ctx.createLinearGradient(...d);
      g.addColorStop(0, st.bg.gradFrom); g.addColorStop(1, st.bg.gradTo);
      ctx.fillStyle = g; ctx.fillRect(0, 0, CW, CH);
    } else {
      ctx.fillStyle = st.bg.color; ctx.fillRect(0, 0, CW, CH);
    }

    // Tint
    if (st.overlay.tint) {
      const r = parseInt(st.overlay.tintColor.slice(1,3),16);
      const g2 = parseInt(st.overlay.tintColor.slice(3,5),16);
      const b = parseInt(st.overlay.tintColor.slice(5,7),16);
      ctx.fillStyle = `rgba(${r},${g2},${b},${st.overlay.tintAmt})`;
      ctx.fillRect(0, 0, CW, CH);
    }

    // Vignette
    if (st.overlay.vignette > 0) {
      const g = ctx.createRadialGradient(CW/2,CH/2,CH*.2,CW/2,CH/2,CW*.85);
      g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,`rgba(0,0,0,${st.overlay.vignette})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, CW, CH);
    }

    // Grain
    if (st.overlay.grain) {
      const id = ctx.createImageData(CW, CH);
      const d = id.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() - 0.5) * 30;
        d[i] = d[i+1] = d[i+2] = 128 + v; d[i+3] = Math.random() * 18 + 4;
      }
      ctx.putImageData(id, 0, 0);
    }

    // Accent
    if (st.accent.type !== 'none') {
      ctx.globalAlpha = st.accent.opacity;
      ctx.fillStyle = st.accent.color;
      if (st.accent.type === 'bar') {
        ctx.fillRect(0, CH-10, CW, 10); ctx.fillRect(0, 0, 8, CH);
      } else if (st.accent.type === 'box') {
        ctx.globalAlpha = 1; ctx.strokeStyle = st.accent.color; ctx.lineWidth = 6;
        ctx.strokeRect(20, 20, CW-40, CH-40);
      } else if (st.accent.type === 'corner') {
        const sz = 80;
        [[0,0,sz,6],[0,0,6,sz],[CW-sz,0,sz,6],[CW-6,0,6,sz],[0,CH-6,sz,6],[0,CH-sz,6,sz],[CW-sz,CH-6,sz,6],[CW-6,CH-sz,6,sz]].forEach(([x,y,w,h]) => ctx.fillRect(x,y,w,h));
      }
      ctx.globalAlpha = 1;
    }

    // Sub label
    if (st.sub.visible && st.sub.text) {
      const fs = 30; ctx.font = `bold ${fs}px Impact, Arial Black, sans-serif`;
      const tw = ctx.measureText(st.sub.text.toUpperCase()).width;
      const pad = 20;
      ctx.fillStyle = st.sub.bgColor; ctx.globalAlpha = .8;
      ctx.fillRect(50, CH-90, tw+pad*2, fs+16); ctx.globalAlpha = 1;
      ctx.fillStyle = st.sub.color; ctx.fillText(st.sub.text.toUpperCase(), 50+pad, CH-90+fs+4);
    }

    // Headline
    if (st.headline.text) {
      const { size, font, color, align, shadow, stroke, strokeColor, strokeW, glow, glowColor, posX, posY } = st.headline;
      ctx.font = `${font==='Georgia'?'bold italic':'bold'} ${size}px ${font}, Impact, Arial Black`;
      ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
      const lines = wrapText(ctx, st.headline.text, CW*.88);
      const lineH = size * 1.15;
      const x = posX * CW;
      const y = posY * CH - ((lines.length * lineH) - lineH) / 2;
      if (glow) { ctx.shadowColor = glowColor; ctx.shadowBlur = 40; }
      lines.forEach((line, i) => {
        const ly = y + i * lineH;
        if (stroke) {
          ctx.lineWidth = strokeW*2; ctx.lineJoin = 'round'; ctx.strokeStyle = strokeColor; ctx.strokeText(line, x, ly);
        }
        if (shadow) {
          ctx.save(); ctx.shadowColor='rgba(0,0,0,0.9)'; ctx.shadowBlur=20; ctx.shadowOffsetX=3; ctx.shadowOffsetY=3;
          ctx.fillStyle = color; ctx.fillText(line, x, ly); ctx.restore();
        } else { ctx.fillStyle = color; ctx.fillText(line, x, ly); }
      });
      ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
    }

    // Update preview
    const prev = prevRef.current;
    if (prev) { const pc = prev.getContext('2d'); if (pc) { pc.clearRect(0,0,320,180); pc.drawImage(canvas,0,0,320,180); } }
  }, [states, variant, bgImages]);

  useEffect(() => { render(); }, [render]);

  const exportPNG = () => {
    const c = canvasRef.current; if (!c) return;
    const a = document.createElement('a'); a.href = c.toDataURL('image/png'); a.download = `thumb-${variant.toLowerCase()}.png`; a.click();
  };
  const exportJPG = () => {
    const c = canvasRef.current; if (!c) return;
    const a = document.createElement('a'); a.href = c.toDataURL('image/jpeg', 0.92); a.download = `thumb-${variant.toLowerCase()}.jpg`; a.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image(); img.onload = () => {
        setBgImages(p => ({...p, [variant]: img}));
        setS(p => ({...p, bg:{...p.bg, type:'image'}}));
      }; img.src = ev.target?.result as string;
    }; reader.readAsDataURL(file);
  };

  const setChannel = (ch: string) => {
    const pal = CH_PALETTES[ch];
    setS({ channel:ch, bg:{...s.bg, color:pal.bg[0], gradFrom:pal.gradFrom, gradTo:pal.gradTo},
      accent:{...s.accent, color:pal.accent}, headline:{...s.headline, glowColor:pal.accent},
      sub:{...s.sub, text:pal.label, color:pal.accent} });
  };

  const wordCount = s.headline.text.split(/\s+/).filter(Boolean).length;
  const ctrOk = [wordCount <= 4, s.headline.color !== s.bg.color, s.sub.visible];

  // Style helpers
  const inp: React.CSSProperties = { background:'rgba(255,255,255,0.04)', border:`1px solid ${T.border}`, borderRadius:6, color:T.text, fontFamily:dropline, fontSize:11, outline:'none', padding:'5px 8px', width:'100%' };
  const secH: React.CSSProperties = { fontFamily:charger, fontWeight:700, fontSize:10, textTransform:'uppercase' as const, letterSpacing:'0.08em', color:T.textMuted, marginBottom:8, display:'block' };
  const tog = (on: boolean) => ({
    width:34, height:18, borderRadius:9, background: on ? T.mint : T.border,
    cursor:'pointer', position:'relative' as const, transition:'background 0.2s', flexShrink:0,
  } as React.CSSProperties);
  const togKnob = (on: boolean) => ({
    position:'absolute' as const, top:2, left: on ? 18 : 2, width:14, height:14,
    borderRadius:'50%', background:'#fff', transition:'left 0.2s',
  });

  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden', fontFamily:dropline, color:T.text }}>

      {/* Left panel — controls */}
      <div style={{ width:260, borderRight:`1px solid ${T.border}`, overflowY:'auto', background:T.panel, flexShrink:0, padding:'14px 14px' }}>

        {/* Variant picker */}
        <div style={{ display:'flex', gap:6, marginBottom:14 }}>
          {(['A','B','C'] as const).map(v => (
            <button key={v} onClick={() => setVariant(v)}
              style={{ flex:1, fontFamily:charger, fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:'0.06em', padding:'7px', background: variant===v ? T.violet : 'transparent', border:`1px solid ${variant===v ? T.violet : T.border}`, color: variant===v ? '#fff' : T.textMuted, borderRadius:7, cursor:'pointer' }}>
              Variant {v}
            </button>
          ))}
        </div>

        {/* Channel */}
        <div style={{ marginBottom:14 }}>
          <span style={secH}>Channel Preset</span>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:5 }}>
            {Object.entries(CH_PALETTES).map(([ch, pal]) => (
              <button key={ch} onClick={() => setChannel(ch)}
                style={{ fontFamily:charger, fontWeight:700, fontSize:8, textTransform:'uppercase', letterSpacing:'0.04em', padding:'6px 4px', background: s.channel===ch ? `${pal.accent}22` : 'transparent', border:`1px solid ${s.channel===ch ? pal.accent : T.border}`, color: s.channel===ch ? pal.accent : T.textMuted, borderRadius:6, cursor:'pointer' }}>
                {ch.replace('-0','-')}
              </button>
            ))}
          </div>
        </div>

        {/* Background */}
        <div style={{ marginBottom:14 }}>
          <span style={secH}>Background</span>
          <div style={{ display:'flex', gap:4, marginBottom:8 }}>
            {(['solid','gradient','image'] as const).map(t => (
              <button key={t} onClick={() => setS(p=>({...p,bg:{...p.bg,type:t}}))}
                style={{ flex:1, fontFamily:charger, fontWeight:700, fontSize:8, textTransform:'uppercase', letterSpacing:'0.04em', padding:'5px', background: s.bg.type===t ? T.violet+'33' : 'transparent', border:`1px solid ${s.bg.type===t ? T.violet : T.border}`, color: s.bg.type===t ? T.violetLight : T.textMuted, borderRadius:5, cursor:'pointer' }}>
                {t}
              </button>
            ))}
          </div>
          {s.bg.type === 'solid' && (
            <>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:6 }}>
                {(CH_PALETTES[s.channel]?.bg || []).map(c => (
                  <div key={c} onClick={() => setS(p=>({...p,bg:{...p.bg,color:c}}))}
                    style={{ width:22, height:22, borderRadius:4, background:c, cursor:'pointer', border:`2px solid ${s.bg.color===c ? '#fff' : 'transparent'}` }} />
                ))}
              </div>
              <input type="color" value={s.bg.color} onChange={e=>setS(p=>({...p,bg:{...p.bg,color:e.target.value}}))} style={{ width:'100%', height:28, borderRadius:5, border:`1px solid ${T.border}`, cursor:'pointer', background:'transparent' }} />
            </>
          )}
          {s.bg.type === 'gradient' && (
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                <span style={{ fontSize:9, color:T.textDim, width:30 }}>From</span>
                <input type="color" value={s.bg.gradFrom} onChange={e=>setS(p=>({...p,bg:{...p.bg,gradFrom:e.target.value}}))} style={{ width:32, height:22, borderRadius:4, border:`1px solid ${T.border}`, cursor:'pointer', background:'transparent' }} />
                <span style={{ fontSize:9, color:T.textDim, width:16 }}>To</span>
                <input type="color" value={s.bg.gradTo} onChange={e=>setS(p=>({...p,bg:{...p.bg,gradTo:e.target.value}}))} style={{ width:32, height:22, borderRadius:4, border:`1px solid ${T.border}`, cursor:'pointer', background:'transparent' }} />
              </div>
              <select style={{ ...inp, fontSize:10 }} value={s.bg.gradDir} onChange={e=>setS(p=>({...p,bg:{...p.bg,gradDir:e.target.value}}))}>
                {['to bottom right','to right','to bottom','to top right'].map(d=><option key={d}>{d}</option>)}
              </select>
            </div>
          )}
          {s.bg.type === 'image' && (
            <label style={{ display:'block', padding:'8px', background:T.card, border:`1px dashed ${T.borderBright}`, borderRadius:7, textAlign:'center', cursor:'pointer', fontSize:11, color:T.textMuted }}>
              {bgImages[variant] ? '🖼️ Image loaded — click to change' : '📁 Click to upload image'}
              <input type="file" accept="image/*" style={{ display:'none' }} onChange={handleImageUpload} />
            </label>
          )}
        </div>

        {/* Overlay */}
        <div style={{ marginBottom:14 }}>
          <span style={secH}>Overlay</span>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              {lbl:'Vignette', on: s.overlay.vignette > 0, toggle: () => setS(p=>({...p,overlay:{...p.overlay,vignette:p.overlay.vignette>0?0:.65}}))},
              {lbl:'Grain', on: s.overlay.grain, toggle: () => setS(p=>({...p,overlay:{...p.overlay,grain:!p.overlay.grain}}))},
              {lbl:'Color Tint', on: s.overlay.tint, toggle: () => setS(p=>({...p,overlay:{...p.overlay,tint:!p.overlay.tint}}))},
            ].map(({lbl,on,toggle}) => (
              <div key={lbl} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontSize:11 }}>{lbl}</span>
                <div style={tog(on)} onClick={toggle}><div style={togKnob(on)} /></div>
              </div>
            ))}
            {s.overlay.tint && (
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                <input type="color" value={s.overlay.tintColor} onChange={e=>setS(p=>({...p,overlay:{...p.overlay,tintColor:e.target.value}}))} style={{ width:32, height:22, borderRadius:4, border:`1px solid ${T.border}`, cursor:'pointer', background:'transparent' }} />
                <input type="range" min={0} max={0.5} step={0.01} value={s.overlay.tintAmt}
                  onChange={e=>setS(p=>({...p,overlay:{...p.overlay,tintAmt:+e.target.value}}))} style={{ flex:1, accentColor:T.violet }} />
              </div>
            )}
          </div>
        </div>

        {/* Accent */}
        <div style={{ marginBottom:14 }}>
          <span style={secH}>Accent Shape</span>
          <div style={{ display:'flex', gap:4, marginBottom:8, flexWrap:'wrap' }}>
            {(['none','bar','box','corner'] as const).map(t => (
              <button key={t} onClick={() => setS(p=>({...p,accent:{...p.accent,type:t}}))}
                style={{ fontFamily:charger, fontWeight:700, fontSize:8, textTransform:'uppercase', letterSpacing:'0.04em', padding:'4px 8px', background: s.accent.type===t ? T.lemon+'22' : 'transparent', border:`1px solid ${s.accent.type===t ? T.lemon : T.border}`, color: s.accent.type===t ? T.lemon : T.textMuted, borderRadius:5, cursor:'pointer' }}>
                {t}
              </button>
            ))}
          </div>
          {s.accent.type !== 'none' && (
            <input type="color" value={s.accent.color} onChange={e=>setS(p=>({...p,accent:{...p.accent,color:e.target.value}}))} style={{ width:'100%', height:24, borderRadius:5, border:`1px solid ${T.border}`, cursor:'pointer', background:'transparent' }} />
          )}
        </div>

        {/* Headline */}
        <div style={{ marginBottom:14 }}>
          <span style={secH}>Headline Text</span>
          <input style={{ ...inp, marginBottom:6 }} placeholder="Headline text..." value={s.headline.text}
            onChange={e=>setS(p=>({...p,headline:{...p.headline,text:e.target.value}}))} />
          <div style={{ display:'flex', gap:6, marginBottom:6, alignItems:'center' }}>
            <span style={{ fontSize:9, color:T.textDim, flexShrink:0 }}>Size</span>
            <input type="range" min={40} max={160} step={2} value={s.headline.size}
              onChange={e=>setS(p=>({...p,headline:{...p.headline,size:+e.target.value}}))} style={{ flex:1, accentColor:T.violet }} />
            <span style={{ fontSize:10, color:T.textMuted, width:28 }}>{s.headline.size}</span>
          </div>
          <div style={{ display:'flex', gap:4, marginBottom:6 }}>
            {['Impact','Arial Black','Georgia','Trebuchet MS'].map(f => (
              <button key={f} onClick={()=>setS(p=>({...p,headline:{...p.headline,font:f}}))}
                style={{ flex:1, fontSize:8, padding:'4px 2px', background: s.headline.font===f ? T.violet+'33' : 'transparent', border:`1px solid ${s.headline.font===f ? T.violet : T.border}`, color: s.headline.font===f ? T.violetLight : T.textDim, borderRadius:4, cursor:'pointer' }}>
                {f.split(' ')[0]}
              </button>
            ))}
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:6 }}>
            {TEXT_SWATCHES.map(c => (
              <div key={c} onClick={()=>setS(p=>({...p,headline:{...p.headline,color:c}}))}
                style={{ width:20, height:20, borderRadius:3, background:c, cursor:'pointer', border:`2px solid ${s.headline.color===c?'#fff':'transparent'}` }} />
            ))}
          </div>
          {/* Position grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:4, marginBottom:6 }}>
            {POS_PRESETS.map((p,i) => (
              <button key={i} onClick={()=>setS(prev=>({...prev,headline:{...prev.headline,posX:p.x,posY:p.y}}))}
                style={{ padding:'5px', fontSize:14, background: Math.abs(s.headline.posX-p.x)<.02 && Math.abs(s.headline.posY-p.y)<.02 ? T.violet+'33' : 'transparent', border:`1px solid ${T.border}`, borderRadius:5, cursor:'pointer', color:T.textMuted }}>
                {p.label}
              </button>
            ))}
          </div>
          <div style={{ display:'flex', gap:4, marginBottom:6 }}>
            {(['left','center','right'] as const).map(a => (
              <button key={a} onClick={()=>setS(p=>({...p,headline:{...p.headline,align:a}}))}
                style={{ flex:1, fontSize:9, padding:'4px', background: s.headline.align===a ? T.violet+'33' : 'transparent', border:`1px solid ${s.headline.align===a ? T.violet : T.border}`, color: s.headline.align===a ? T.violetLight : T.textDim, borderRadius:4, cursor:'pointer', fontFamily:charger, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em' }}>
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Text Effects */}
        <div style={{ marginBottom:14 }}>
          <span style={secH}>Text Effects</span>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              {lbl:'Shadow', on:s.headline.shadow, toggle:()=>setS(p=>({...p,headline:{...p.headline,shadow:!p.headline.shadow}}))},
              {lbl:'Stroke / Outline', on:s.headline.stroke, toggle:()=>setS(p=>({...p,headline:{...p.headline,stroke:!p.headline.stroke}}))},
              {lbl:'Glow', on:s.headline.glow, toggle:()=>setS(p=>({...p,headline:{...p.headline,glow:!p.headline.glow}}))},
            ].map(({lbl,on,toggle}) => (
              <div key={lbl} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontSize:11 }}>{lbl}</span>
                <div style={tog(on)} onClick={toggle}><div style={togKnob(on)} /></div>
              </div>
            ))}
            {s.headline.stroke && (
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                <input type="color" value={s.headline.strokeColor} onChange={e=>setS(p=>({...p,headline:{...p.headline,strokeColor:e.target.value}}))} style={{ width:28, height:22, borderRadius:4, border:`1px solid ${T.border}`, cursor:'pointer', background:'transparent' }} />
                <input type="range" min={1} max={12} value={s.headline.strokeW}
                  onChange={e=>setS(p=>({...p,headline:{...p.headline,strokeW:+e.target.value}}))} style={{ flex:1, accentColor:T.violet }} />
              </div>
            )}
            {s.headline.glow && (
              <input type="color" value={s.headline.glowColor} onChange={e=>setS(p=>({...p,headline:{...p.headline,glowColor:e.target.value}}))} style={{ width:'100%', height:24, borderRadius:5, border:`1px solid ${T.border}`, cursor:'pointer', background:'transparent' }} />
            )}
          </div>
        </div>

        {/* Sub Label */}
        <div style={{ marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
            <span style={secH}>Sub Label</span>
            <div style={tog(s.sub.visible)} onClick={()=>setS(p=>({...p,sub:{...p.sub,visible:!p.sub.visible}}))}><div style={togKnob(s.sub.visible)} /></div>
          </div>
          {s.sub.visible && (
            <>
              <input style={{ ...inp, marginBottom:6 }} placeholder="Channel name or topic tag..." value={s.sub.text}
                onChange={e=>setS(p=>({...p,sub:{...p.sub,text:e.target.value}}))} />
              <div style={{ display:'flex', gap:6 }}>
                <div><span style={{ fontSize:9, color:T.textDim }}>Text</span>
                  <input type="color" value={s.sub.color} onChange={e=>setS(p=>({...p,sub:{...p.sub,color:e.target.value}}))} style={{ display:'block', width:44, height:24, borderRadius:4, border:`1px solid ${T.border}`, cursor:'pointer', background:'transparent' }} /></div>
                <div><span style={{ fontSize:9, color:T.textDim }}>BG</span>
                  <input type="color" value={s.sub.bgColor} onChange={e=>setS(p=>({...p,sub:{...p.sub,bgColor:e.target.value}}))} style={{ display:'block', width:44, height:24, borderRadius:4, border:`1px solid ${T.border}`, cursor:'pointer', background:'transparent' }} /></div>
              </div>
            </>
          )}
        </div>

      </div>

      {/* Canvas area */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:24, overflow:'hidden' }}>
          <canvas ref={canvasRef} width={CW} height={CH}
            style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain', borderRadius:4, boxShadow:'0 8px 40px rgba(0,0,0,0.6)' }} />
        </div>

        {/* Bottom bar */}
        <div style={{ padding:'12px 24px', borderTop:`1px solid ${T.border}`, display:'flex', alignItems:'center', gap:16, background:T.panel }}>
          <div style={{ fontFamily:dropline, fontSize:10, letterSpacing:'0.08em', color:T.textDim }}>1280 × 720 · PNG/JPG · Under 2MB</div>
          <div style={{ flex:1 }} />
          {/* CTR hints */}
          <div style={{ display:'flex', gap:8 }}>
            {[
              {ok: wordCount <= 4, txt:'≤4 words: +30% CTR'},
              {ok: s.sub.visible, txt:'Sub label visible'},
            ].map(({ok,txt}) => (
              <div key={txt} style={{ fontSize:9, padding:'4px 8px', borderRadius:4, border:`1px solid ${ok ? T.mint+'44' : T.border}`, color: ok ? T.mint : T.textDim, background: ok ? T.mint+'0A' : 'transparent' }}>{ok?'✓ ':''}{txt}</div>
            ))}
          </div>
          <button onClick={exportPNG}
            style={{ fontFamily:charger, fontWeight:700, fontSize:10, textTransform:'uppercase', letterSpacing:'0.06em', padding:'8px 18px', background:T.mint, border:'none', color:'#000', borderRadius:8, cursor:'pointer' }}>
            Export PNG
          </button>
          <button onClick={exportJPG}
            style={{ fontFamily:charger, fontWeight:700, fontSize:10, textTransform:'uppercase', letterSpacing:'0.06em', padding:'8px 18px', background:T.violet, border:'none', color:'#fff', borderRadius:8, cursor:'pointer' }}>
            Export JPG
          </button>
        </div>
      </div>

      {/* Right: preview + CTR rules */}
      <div style={{ width:220, borderLeft:`1px solid ${T.border}`, display:'flex', flexDirection:'column', overflow:'hidden', background:T.panel }}>
        <div style={{ padding:'12px 14px', borderBottom:`1px solid ${T.border}` }}>
          <span style={secH}>Preview (64px)</span>
          <canvas ref={prevRef} width={320} height={180} style={{ width:'100%', borderRadius:6 }} />
        </div>
        <div style={{ padding:'12px 14px' }}>
          <span style={secH}>CTR Rules</span>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {[
              {ok: wordCount <= 4, txt:'≤4 words: +30% CTR'},
              {ok: true, txt:'High contrast text/bg'},
              {ok: true, txt:'Title ≠ thumbnail text'},
              {ok: false, txt:'Face + emotion: +25% CTR'},
              {ok: wordCount <= 6, txt:'Readable at 64px'},
            ].map(({ok,txt}) => (
              <div key={txt} style={{ fontSize:9, padding:'5px 7px', borderRadius:4, border:`1px solid ${T.border}`, color: T.textDim, lineHeight:1.4, display:'flex', gap:5 }}>
                <span style={{ color: ok ? T.mint : T.berry }}>{ok?'✓':'·'}</span>{txt}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
