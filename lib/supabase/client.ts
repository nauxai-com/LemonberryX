import { createClient as _createClient } from '@supabase/supabase-js';

let _supabase: ReturnType<typeof _createClient> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabase(): any {
  if (!_supabase) {
    _supabase = _createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
  }
  return _supabase;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: any = new Proxy({} as any, {
  get(_target, prop) {
    return (getSupabase() as any)[prop as string];
  },
});
