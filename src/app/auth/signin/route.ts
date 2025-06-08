import { NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabaseRouteClient";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const supabase = createSupabaseRouteClient();
  const formData = await req.formData();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.redirect(`/auth?error=${encodeURIComponent(error.message)}`, { status: 302 });
  }

  return NextResponse.redirect(new URL("/home", req.url), { status: 302 });
}
