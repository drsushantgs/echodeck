// src/app/auth/signup/route.ts
import { NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabaseRouteClient";

function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number.";
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return "Password should contain at least one special character.";
  }
  return null;
}

export async function POST(req: Request) {
  const supabase = createSupabaseRouteClient();
  const formData = await req.formData();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string | null;

  // Server-side password validation
  const validationError = validatePassword(password);
  if (validationError) {
    // Return with an error query param to show it on the client if you want
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(validationError)}`, req.url),
      { status: 302 }
    );
  }

  // Signup with metadata (firstName)
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        firstName,
      },
    },
  });

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(error.message)}`, req.url),
      { status: 302 }
    );
  }

  return NextResponse.redirect(new URL("/auth/success", req.url), { status: 302 });
}
