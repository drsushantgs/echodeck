// middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  await supabase.auth.getSession(); // Load session if it exists
  const { data: { session }, error } = await supabase.auth.getSession();
  console.log("MIDDLEWARE SESSION:", session);
  console.log("COOKIES NOW:", req.cookies.getAll());

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};