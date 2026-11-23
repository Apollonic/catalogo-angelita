import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://rahtjebtjtmuchavsskh.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhaHRqZWJ0anRtdWNoYXZzc2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU0Njg2NjIsImV4cCI6MjExMTA0NDY2Mn0.RziUeQlIccUMVLAy7bAOggqUdTYH3IUlAP-Z8aSwqpU';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://seu-projeto.supabase.co' &&
    !supabaseUrl.includes('sua-url')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
