import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase environment variables not configured. Using mock data.")
    return null as any
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

export function isSupabaseConfigured() {
  return !!(supabaseUrl && supabaseAnonKey)
}
