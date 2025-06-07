// src/app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  // ✅ Await the cookies() call!
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { event, session } = await req.json();

  // ✅ This will now write proper sb-access-token / sb-refresh-token cookies
  await supabase.auth.setSession(session);

  return NextResponse.json({ success: true });
}
