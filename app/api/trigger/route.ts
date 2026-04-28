import { NextRequest, NextResponse } from 'next/server';
import { triggerN8n } from '@/lib/n8n';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { action, payload } = await req.json();

  await supabase.from('automation_logs').insert({ action, status: 'running', payload: payload || {} });

  try {
    const result = await triggerN8n(action, payload);
    await supabase.from('automation_logs').update({ status: 'done', result }).eq('action', action);
    return NextResponse.json({ success: true, message: `${action} triggered successfully`, result });
  } catch (err: any) {
    await supabase.from('automation_logs').update({ status: 'error', result: { error: err.message } }).eq('action', action);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
