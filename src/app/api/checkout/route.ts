// src/app/api/checkout/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseRouteClient } from "@/lib/supabaseRouteClient";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing Stripe secret key");
  return new Stripe(key);
}

export async function POST(req: NextRequest) {
  const supabase = createSupabaseRouteClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Parse incoming JSON
  const formData = await req.formData();
  const subjectUuid = formData.get("subjectUuid") as string;

  if (!subjectUuid) {
    return NextResponse.json({ error: "Missing subject UUID." }, { status: 400 });
  }

  // Fetch subject from Supabase
  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .select("subject_name, stripe_price_id")
    .eq("uuid_id", subjectUuid)
    .maybeSingle();

  if (!subject || subjectError) {
    return NextResponse.json({ error: "Subject not found" }, { status: 404 });
  }

  if (!subject.stripe_price_id) {
    return NextResponse.json({ error: "Pricing not configured" }, { status: 500 });
  }

  // Create Stripe session
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price: subject.stripe_price_id,
          quantity: 1,
        },
      ],
      success_url: `${req.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/cancel`,
      metadata: {
        subjectUuid,
        userId: user.id,
      },
    });

    return NextResponse.redirect(session.url!, { status: 303 });
  } catch (err: any) {
    console.error("Stripe error:", err);
    return NextResponse.json(
      { error: err.message || "Stripe session creation failed." },
      { status: 500 }
    );
  }
}