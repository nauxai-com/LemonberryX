'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Channel } from '@/lib/supabase/types';

const STATIC_CHANNELS = [
  {
    id: 's1', chNum: 'CH-01', name: 'Grimm Archives', status: 'live',
    niche: 'History + finance mystery — money heists, hidden wealth, lost treasures, mystery gold, inheritance scandals',
    rpm_target: '$18–45', audience: 'US',
    stats: [
      { label: 'Target RPM', value: '$18–45', color: 'var(--lemon)' },
      { label: 'Audience',   value: 'US',     color: 'var(--violet-light)' },
      { label: 'Format',     value: '10–12min + Shorts', color: 'var(--mint)' },
      { label: '30-Day Plan',value: '30 videos',         color: 'var(--lemon)' },
    ],
    note: 'Voice: ElevenLabs / Kokoro · Visuals: Whisk + Hunyuan',
    noteBg: 'rgba(0,245,196,0.05)', noteBorder: 'rgba(0,245,196,0.2)',
  },
  {
    id: 's2', chNum: 'CH-02', name: 'Betrayal & Revenge', status: 'repositioning',
    niche: 'Betrayal & Revenge True Stories — fastest growing YouTube category',
    rpm_target: '$12–13', audience: 'US',
    stats: [
      { label: 'Target RPM',    value: '$12–13',          color: 'var(--lemon)' },
      { label: 'Audience',      value: 'US',              color: 'var(--violet-light)' },
      { label: 'Growth Signal', value: '21x rate',        color: 'var(--berry)' },
      { label: 'Format',        value: '8–15min + Shorts', color: 'var(--violet-light)' },
    ],
    note: 'Not yet live — repositioning in progress',
    noteBg: 'var(--lemon-dim)', noteBorder: 'rgba(232,244,0,0.2)',
  },
  {
    id: 's3', chNum: 'CH-03', name: 'Jungian Psychology', status: 'paused',
    niche: 'Jungian Psychology & Shadow Work — low competition, high LTV for digital products',
    rpm_target: '$7–12', audience: 'Global',
    stats: [
      { label: 'Target RPM',  value: '$7–12',  color: 'var(--lemon)' },
      { label: 'Audience',    value: 'Global', color: 'var(--violet-light)' },
      { label: 'LTV',         value: 'High',   color: 'var(--mint)' },
      { label: 'Competition', value: 'Low',    color: 'var(--mint)' },
    ],
    note: '',
    noteBg: '', noteBorder: '',
  },
  {
    id: 's4', chNum: 'CH-04', name: 'Sleep Soundscapes', status: 'paused',
    niche: 'Sleep Soundscapes & Sleep Stories — passive income machine, 1–8hr uploads',
    rpm_target: '$10.92', audience: 'Global',
    stats: [
      { label: 'Target RPM',  value: '$10.92',       color: 'var(--lemon)' },
      { label: 'Audience',    value: 'Global',        color: 'var(--violet-light)' },
      { label: 'Upload Rate', value: '2x/month',      color: 'var(--mint)' },
      { label: 'Format',      value: '1–8hr passive', color: 'var(--violet-light)' },
    ],
    note: '',
    noteBg: '', noteBorder: '',
  },
];

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  live:          { label: '● LIVE',          cls: 'badge-live' },
  repositioning: { label: '⟳ REPOSITIONING', cls: 'badge-reposition' },
  paused:        { label: '⏸ PAUSED',        cls: 'badge-paused' },
};

export default function DashboardPage() {
  const [dbChannels, setDbChannels] = useState<Channel[]>([]);

  useEffect(() => {
    supabase.from('channels').select('*').order('created_at').then(({ data }) => {
      setDbChannels(data || []);
    });
  }, []);

  return (
    <div className="fade-in">
      <p className="section-title">Active Channel Roster — 4 Channels</p>
      <div className="grid-2" style={{ gap: 20 }}>
        {STATIC_CHANNELS.map((ch, i) => {
          const live = dbChannels.find((_, idx) => idx === i);
          const status = (live?.status || ch.status) as string;
          const badge = STATUS_BADGE[status] || STATUS_BADGE.paused;

          return (
            <div key={ch.id} className={`channel-card ${status === 'repositioning' ? 'reposition' : status}`}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ fontFamily: 'Dropline, sans-serif', fontSize: 10, color: 'var(--text-dim)', marginBottom: 4, letterSpacing: '0.08em' }}>
                    {ch.chNum}
                  </div>
                  <div style={{
                    fontFamily: 'ChargerExtrabold, Outfit, sans-serif',
                    fontWeight: 900, fontSize: 17,
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                    color: 'var(--text)', WebkitTextFillColor: 'var(--text)',
                    background: 'none',
                  }}>
                    {ch.name}
                  </div>
                </div>
                <span className={`badge ${badge.cls}`}>{badge.label}</span>
              </div>

              {/* Niche */}
              <div style={{ fontSize: 12, color: 'var(--text-muted)', margin: '8px 0 16px', lineHeight: 1.55, fontFamily: 'Dropline, sans-serif' }}>
                {ch.niche}
              </div>

              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {ch.stats.map(s => (
                  <div key={s.label} className="stat-box">
                    <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3, fontFamily: 'Dropline, sans-serif' }}>
                      {s.label}
                    </div>
                    <div style={{ fontFamily: 'Dropline, sans-serif', fontSize: 13, color: s.color, fontWeight: 700, letterSpacing: '0.05em' }}>
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Note */}
              {ch.note && (
                <div style={{
                  marginTop: 14, padding: '10px 14px',
                  background: ch.noteBg, border: `1px solid ${ch.noteBorder}`,
                  borderRadius: 8, fontSize: 12, color: 'var(--text-muted)',
                  fontFamily: 'Dropline, sans-serif',
                }}>
                  {ch.note}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
