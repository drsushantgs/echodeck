import { NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabaseRouteClient";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const supabase = createSupabaseRouteClient();

  await supabase.auth.signOut();

  return NextResponse.redirect(new URL("/auth", req.url), { status: 302 });
}
