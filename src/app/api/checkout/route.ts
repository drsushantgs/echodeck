// src/app/api/checkout/route.ts

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  createSupabaseServerClient,
  getUserIdFromServer,
} from "@/lib/supabaseServer";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing Stripe secret key");
  return new Stripe(key);
}

export async function POST(req: NextRequest) {
  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 1: Get the logged-in user from cookies (safely)
  // ─────────────────────────────────────────────────────────────────────────────
  const userId = await getUserIdFromServer();
  if (!userId) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 2: Parse body payload
  // ─────────────────────────────────────────────────────────────────────────────
  let payload: { subjectUuid?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const subjectUuid = payload.subjectUuid;
  if (!subjectUuid) {
    return NextResponse.json({ error: "Missing subject UUID." }, { status: 400 });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 3: Fetch subject from Supabase
  // ─────────────────────────────────────────────────────────────────────────────
  const supabase = await createSupabaseServerClient();
  const { data: subject, error: supaError } = await supabase
    .from("subjects")
    .select("subject_name, stripe_price_id")
    .eq("uuid_id", subjectUuid)
    .single();

  if (supaError || !subject) {
    console.error("Supabase fetch error:", supaError);
    return NextResponse.json({ error: "Subject not found." }, { status: 404 });
  }

  if (!subject.stripe_price_id) {
    console.error("No stripe_price_id for subject:", subjectUuid);
    return NextResponse.json({ error: "Pricing not configured." }, { status: 500 });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 4: Create Stripe checkout session
  // ─────────────────────────────────────────────────────────────────────────────
  let stripe: Stripe;
  try {
    stripe = getStripe();
  } catch (stripeInitErr: any) {
    console.error("Stripe init error:", stripeInitErr.message);
    return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 });
  }

  try {
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
        userId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (stripeErr: any) {
    console.error("Stripe checkout.sessions.create error:", stripeErr);
    return NextResponse.json(
      { error: stripeErr.message || "Stripe session error." },
      { status: 500 }
    );
  }
}
