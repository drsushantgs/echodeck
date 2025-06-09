// ───────────────────────────────────────────────────────────────────────────────
// src/app/api/webhooks/stripe/route.ts
// ───────────────────────────────────────────────────────────────────────────────

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

/** 
 * 1) Initialize Stripe with your secret key (used for signature verification).
 */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/** 
 * 2) Your Stripe Webhook Signing Secret (copy this from Dashboard → Webhooks).
 */
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/** 
 * 3) Initialize Supabase with a Service-Role key so we can write to `purchases`.
 */
const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  // ─────────────────────────────────────────────────────────────────────────────
  // STEP A: Read the *raw* request body into a Buffer (for Stripe signature check)
  // ─────────────────────────────────────────────────────────────────────────────
  let buf: Buffer;
  try {
    const rawArrayBuffer = await req.arrayBuffer();
    buf = Buffer.from(rawArrayBuffer);
  } catch (e: any) {
    console.error("Failed to read raw request body:", e);
    return NextResponse.json(
      { error: "Could not read webhook body" },
      { status: 400 }
    );
  }

  // 1) Grab Stripe’s signature header
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    console.error("Missing stripe-signature header");
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  // 2) Verify the event
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
    console.log("✅ Webhook verified:", event.type);
  } catch (err: any) {
    console.error(
      "❌ Webhook signature verification failed:",
      err.message
    );
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP B: Handle the specific event type(s) you care about
  // ─────────────────────────────────────────────────────────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log("💳 checkout.session.completed:", session.id);
    console.log("→ Metadata on session:", session.metadata);

    const subjectUuid = session.metadata?.subjectUuid as string | undefined;
    const userId      = session.metadata?.userId as string | undefined;

    if (!subjectUuid || !userId) {
      console.error(
        "⚠️ Missing subjectUuid or userId in session.metadata:",
        session.metadata
      );
      // Return 200 so Stripe stops retrying. We’re not inserting anything.
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Attempt to insert a new “purchase” record
    try {
      console.log(
        "→ Inserting purchase row:",
        { subjectUuid, userId, sessionId: session.id }
      );
      const { data, error } = await supabaseServer
        .from("purchases")
        .insert({
          subject_uuid:      subjectUuid,
          user_id:           userId,
          stripe_session_id: session.id,
          amount:            session.amount_total ?? 0,
          payment_confirmed: true,
        });

      if (error) {
        console.error("❌ Supabase insert error:", error);
        // Return HTTP 200 so Stripe does not retry endlessly
        return NextResponse.json({ received: true }, { status: 200 });
      }
      console.log("✅ Purchase recorded:", data);
    } catch (dbErr: any) {
      console.error("❌ Unexpected DB error:", dbErr);
      // Still respond 200—Stripe expects a 2xx
      return NextResponse.json({ received: true }, { status: 200 });
    }
  } else {
    console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }

  // Always return 200 to acknowledge receipt
  return NextResponse.json({ received: true });
}
