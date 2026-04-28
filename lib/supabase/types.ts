export type ChannelStatus = 'live' | 'repositioning' | 'paused';
export type QueueStatus = 'idea' | 'research' | 'script' | 'production' | 'done';
export type Priority = 'high' | 'mid' | 'low';
export type AutomationStatus = 'pending' | 'running' | 'done' | 'error';

export interface Channel {
  id: string;
  name: string;
  niche: string | null;
  status: ChannelStatus;
  rpm_target: string | null;
  rpm_pct: number;
  audience: string;
  cpm_tier: string | null;
  note: string | null;
  pipeline_stage: number;
  created_at: string;
}

export interface QueueItem {
  id: string;
  title: string;
  channel_id: string | null;
  day_number: number | null;
  source: string;
  status: QueueStatus;
  priority: Priority;
  ab_curiosity: string | null;
  ab_fear: string | null;
  ab_result: string | null;
  script_content: string | null;
  compliance_score: number | null;
  notes: string | null;
  created_at: string;
  channels?: Channel;
}

export interface ComplianceLog {
  id: string;
  queue_id: string | null;
  channel_id: string | null;
  score: number | null;
  originality_score: number | null;
  production_score: number | null;
  compliance_score: number | null;
  flags: Record<string, unknown> | null;
  checked_at: string;
}

export interface AutomationLog {
  id: string;
  action: string;
  channel_id: string | null;
  queue_id: string | null;
  status: AutomationStatus;
  payload: Record<string, unknown> | null;
  result: Record<string, unknown> | null;
  triggered_at: string;
}

export interface Database {
  public: {
    Tables: {
      channels: { Row: Channel; Insert: Omit<Channel, 'id' | 'created_at'>; Update: Partial<Omit<Channel, 'id'>>; };
      queue: { Row: QueueItem; Insert: Omit<QueueItem, 'id' | 'created_at'>; Update: Partial<Omit<QueueItem, 'id'>>; };
      compliance_logs: { Row: ComplianceLog; Insert: Omit<ComplianceLog, 'id' | 'checked_at'>; Update: Partial<Omit<ComplianceLog, 'id'>>; };
      automation_logs: { Row: AutomationLog; Insert: Omit<AutomationLog, 'id' | 'triggered_at'>; Update: Partial<Omit<AutomationLog, 'id'>>; };
    };
  };
}
