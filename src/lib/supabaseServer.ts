// lib/supabaseServer.ts

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * The result of calling `cookies()` in a Route Handler is a ReadonlyRequestCookies,
 * which you can capture simply by:
 *
 *    const cookieStore = cookies();
 *
 * Here, we alias that type so our helpers know exactly what to expect.
 */
type CookieStore = ReturnType<typeof cookies>;

/**
 * Given a CookieStore (from `cookies()`), build a Supabase client
 * that can read the “sb-access-token” and “sb-refresh-token” from cookies.
 *
 * Call this inside an App‐Router route handler **after** you do:
 *    const cookieStore = cookies();
 *    const supabase = createSupabaseServerClientFromCookieStore(cookieStore);
 *
 * IMPORTANT: This function must remain synchronous with respect to `cookieStore`.
 * That means: do NOT write `await cookieStore` or make this function async.
 */
export function createSupabaseServerClientFromCookieStore(
  cookieStore: CookieStore
): SupabaseClient {
  // Extract the two Supabase tokens from cookieStore synchronously:
  const accessToken  = cookieStore.get("sb-access-token")?.value ?? null;
  const refreshToken = cookieStore.get("sb-refresh-token")?.value ?? null;

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // or anon/anon key if you only need user‐read
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storage: {
          // We give Supabase a “fake storage” that simply returns our cookie values
          getItem: (key) => {
            if (key === "sb-access-token")  return Promise.resolve(accessToken);
            if (key === "sb-refresh-token") return Promise.resolve(refreshToken);
            return Promise.resolve(null);
          },
          setItem: () => Promise.resolve(),
          removeItem: () => Promise.resolve(),
        },
      },
    }
  );
}

/**
 * Utility: “Read the current user’s ID from Supabase, or return null if not signed in.”
 * Call this from your route handler **after** you do:
 *    const cookieStore = cookies();
 */
export async function getUserIdFromCookieStore(
  cookieStore: CookieStore
): Promise<string | null> {
  // Build the Supabase client synchronously:
  const supabase = createSupabaseServerClientFromCookieStore(cookieStore);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user.id;
}
