'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Channel } from '@/lib/supabase/types';
import ChannelCard from '@/components/dashboard/ChannelCard';

export default function DashboardPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('channels').select('*').order('created_at').then(({ data }: any) => {
      setChannels(data || []);
      setLoading(false);
    });
  }, []);

  const active        = channels.filter((c: Channel) => c.status === 'live').length;
  const repositioning = channels.filter((c: Channel) => c.status === 'repositioning').length;
  const paused        = channels.filter((c: Channel) => c.status === 'paused').length;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <>
      {/* HEADER */}
      <div className="header">
        <div className="title-block">
          <h1>Dashboard</h1>
          <p>{channels.length} channels · 30 videos queued</p>
        </div>
        <div className="date">{today}</div>
      </div>

      {/* STATS */}
      <div className="stats">
        <div className="stat-card">{active}<span>Active</span></div>
        <div className="stat-card">{repositioning}<span>Processing</span></div>
        <div className="stat-card">{paused}<span>Paused</span></div>
        <div className="stat-card highlight">30<span>Queued</span></div>
      </div>

      {/* CHANNEL CARDS — when Supabase connected */}
      {!loading && channels.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 20,
          marginTop: 32,
        }}>
          {channels.map((ch: Channel, i: number) => (
            <ChannelCard key={ch.id} channel={ch} index={i} />
          ))}
        </div>
      )}

      {/* HERO — orb + dot grids */}
      <div className="hero">
        <div className="orb" />
        <div className="dot-grid" />
        <div className="dot-grid right" />
      </div>
    </>
  );
}
