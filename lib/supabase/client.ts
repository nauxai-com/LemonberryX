import { createClient as _createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// No-op stub when Supabase isn't configured yet
const noopClient = {
  from: () => ({
    select: () => ({ order: () => Promise.resolve({ data: [], error: null }), then: (fn: any) => Promise.resolve({ data: [], error: null }).then(fn) }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
    delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
  }),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: any = url && key ? _createClient(url, key) : noopClient;
