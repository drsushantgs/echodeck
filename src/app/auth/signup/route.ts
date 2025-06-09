// src/app/auth/signup/route.ts
import { NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabaseRouteClient";

export async function POST(req: Request) {
  const supabase = createSupabaseRouteClient();
  const formData = await req.formData();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(error.message)}`, req.url),
      { status: 302 }
    );
  }

  return NextResponse.redirect(new URL("/auth/success", req.url), { status: 302 });
}