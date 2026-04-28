'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { QueueItem, Priority } from '@/lib/supabase/types';

const priorityCycle: Priority[] = ['high', 'mid', 'low'];
const priorityColors: Record<Priority, string> = { high: '#EF4444', mid: '#F59E0B', low: 'rgba(255,255,255,0.3)' };

interface Props {
  item: QueueItem;
  onSelect: () => void;
  onDelete: () => void;
  onUpdate: () => void;
}

export default function QueueItemRow({ item, onSelect, onDelete, onUpdate }: Props) {
  const [hovered, setHovered] = useState(false);
  const [priority, setPriority] = useState(item.priority);

  const cyclePriority = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = priorityCycle[(priorityCycle.indexOf(priority) + 1) % priorityCycle.length];
    setPriority(next);
    await supabase.from('queue').update({ priority: next }).eq('id', item.id);
    onUpdate();
  };

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer"
      style={{ background: hovered ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
    >
      {/* Priority dot */}
      <button
        onClick={cyclePriority}
        className="w-3 h-3 rounded-full shrink-0 transition-transform hover:scale-125"
        style={{ background: priorityColors[priority] }}
        title={`Priority: ${priority}`}
      />

      {/* Day label */}
      <span className="text-xs w-8 shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }}>
        {item.day_number ? `D${item.day_number}` : '—'}
      </span>

      {/* Title */}
      <span className="flex-1 text-sm truncate" style={{ color: '#fff' }}>{item.title}</span>

      {/* Channel chip */}
      {(item as any).channels?.name && (
        <span className="text-xs px-2 py-0.5 rounded-full shrink-0" style={{ background: 'rgba(124,58,237,0.2)', color: '#D946EF' }}>
          {(item as any).channels.name}
        </span>
      )}

      {/* Source chip */}
      <span className="text-xs px-2 py-0.5 rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}>
        {item.source}
      </span>

      {/* Status */}
      <span className={`badge badge-${item.status} shrink-0`}>{item.status}</span>

      {/* Delete */}
      {hovered && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          className="text-sm shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-500/20"
          style={{ color: 'rgba(239,68,68,0.7)' }}
        >
          ×
        </button>
      )}
    </div>
  );
}
