
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create the main client
export const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

// Export a function that creates a configured client
export const createClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL or key is missing");
    return null;
  }
  return createSupabaseClient(supabaseUrl, supabaseKey);
};

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};
        