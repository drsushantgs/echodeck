// src/app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = await cookies();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storage: {
          getItem: async (key) => {
            if (key === "sb-access-token") return cookieStore.get("sb-access-token")?.value ?? null;
            if (key === "sb-refresh-token") return cookieStore.get("sb-refresh-token")?.value ?? null;
            return null;
          },
          setItem: async () => {},
          removeItem: async () => {},
        },
      },
    }
  );

  const { event, session } = await req.json();
  await supabase.auth.setSession(session);

  return NextResponse.json({ success: true });
}
