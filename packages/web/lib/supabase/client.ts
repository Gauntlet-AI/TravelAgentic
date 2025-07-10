/**
 * Supabase Client Configuration
 * Browser-side client for authentication and database operations
 */

import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for browser usage
 * Used for client-side authentication and database operations
 */
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Export singleton instance
export const supabase = createSupabaseClient(); 