import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

/**
 * Get or create a singleton Supabase client instance.
 * This ensures only one client is created and shared across the application,
 * preventing the "Multiple GoTrueClient instances detected" warning.
 */
export function getSupabaseClient(): SupabaseClient {
  // On server side, return null (handled by callers)
  if (typeof window === "undefined") {
    throw new Error("Supabase client can only be used on the client side");
  }

  // Return existing client if already created
  if (supabaseClient) {
    return supabaseClient;
  }

  // Create new client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}

/**
 * Get the current access token from the Supabase session.
 * Uses the singleton client to avoid creating multiple instances.
 */
export async function getCurrentAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  try {
    const supabase = getSupabaseClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      return null;
    }

    return session.access_token || null;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}
