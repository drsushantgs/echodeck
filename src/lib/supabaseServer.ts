// lib/supabaseServer.ts

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

/**
 * Create a Supabase client from cookies—no arguments required.
 * Safe for usage in Next.js 14.1+ dynamic APIs (cookies() is now async).
 */
async function getCookieStore() {
  return cookies(); // ✅ await required
}

export async function createSupabaseServerClient() {
  const cookieStore = await getCookieStore();

  const accessToken = cookieStore.get("sb-access-token")?.value ?? null;
  const refreshToken = cookieStore.get("sb-refresh-token")?.value ?? null;
  console.log("[CHECKOUT] sb-access-token:", accessToken);

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storage: {
          getItem: async (key) => {
            if (key === "sb-access-token") return accessToken;
            if (key === "sb-refresh-token") return refreshToken;
            return null;
          },
          setItem: async () => {},
          removeItem: async () => {},
        },
      },
    }
  );
}

/**
 * Get the logged-in user’s ID from cookies.
 */
export async function getUserIdFromServer(): Promise<string | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb-access-token")?.value ?? null;
  console.log("[CHECKOUT] sb-access-token:", accessToken);

  if (!accessToken) return null;

  try {
    const decoded: any = jwt.decode(accessToken);
    return decoded?.sub ?? null;
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
}