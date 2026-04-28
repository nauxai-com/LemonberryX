'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Channel } from '@/lib/supabase/types';
import ChannelCard from '@/components/dashboard/ChannelCard';
import TopBar from '@/components/layout/TopBar';

export default function DashboardPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('channels').select('*').order('created_at').then(({ data }) => {
      setChannels(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Dashboard"
        subtitle={`${channels.length} channels · 30 videos queued`}
      />
      <div className="p-8 flex-1">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-5">
            {[1,2,3,4].map(i => (
              <div key={i} className="glass-card p-5 h-64 animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {channels.map((ch, i) => <ChannelCard key={ch.id} channel={ch} index={i} />)}
          </div>
        )}

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { label: 'Active Channels', value: channels.filter(c => c.status === 'live').length, color: '#10B981' },
            { label: 'Repositioning',   value: channels.filter(c => c.status === 'repositioning').length, color: '#F59E0B' },
            { label: 'Paused',          value: channels.filter(c => c.status === 'paused').length, color: 'rgba(255,255,255,0.4)' },
            { label: 'Videos Queued',   value: 30, color: '#7C3AED' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-card p-4 text-center">
              <div className="text-3xl font-bold" style={{ color, fontFamily: 'Outfit' }}>{value}</div>
              <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
