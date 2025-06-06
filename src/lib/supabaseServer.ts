// lib/supabaseServer.ts
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

/**
 * Reads the Supabase-authenticated user from the request’s cookies.
 * Returns the user ID (string), or null if no user is logged in.
 */
export async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  // Create a Supabase client on the server that picks its URL/anon key from NEXT_PUBLIC_* env.
  // We only need to pass the `cookies` function so it knows where to look for the auth token.
  const supabase = createServerComponentClient({
    cookies: async () => cookies(), // <-- wrap in async function
  });

  // Ask Supabase Auth who the current user is
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }
  return data.user.id;
}