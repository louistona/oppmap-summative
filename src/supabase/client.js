import { createClient } from '@supabase/supabase-js';

// Ensure these environment variables are set in your .env file
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing in environment variables.');
  // Handle this error appropriately in a real app (e.g., throw error, display message)
}

// Create a single Supabase client for your application
export const supabase = createClient(supabaseUrl, supabaseAnonKey);