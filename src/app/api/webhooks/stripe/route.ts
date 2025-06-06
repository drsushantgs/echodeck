// <project-root>/src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// —————————————————————————————————————————————————————————————————————————————
// 1) Initialize Stripe and Supabase clients

// Use your Stripe secret key here (not the public key). We only need it for signing.
const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;
const stripe = new Stripe(stripeSecretKey);

// Webhook signing secret you copied from Stripe Dashboard:
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Initialize Supabase server‐side client (you can use your service‐role key here):
const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // or anon key if you prefer
const supabaseServer = createClient(supaUrl, supaKey);
// —————————————————————————————————————————————————————————————————————————————

// 2) Utility to read raw body from NextRequest
async function buffer(readable: ReadableStream<Uint8Array> | null) {
  if (!readable) return Buffer.from("");
  const reader = readable.getReader();
  let chunks: Uint8Array[] = [];
  let done = false;

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    if (value) chunks.push(value);
    done = doneReading;
  }
  return Buffer.concat(chunks);
}

// 3) The POST handler for /api/webhooks/stripe
export async function POST(req: NextRequest) {
  // 1) Read raw body
  const buf = await buffer(req.body);
  const sig = req.headers.get("stripe-signature")!;

  console.log("🔔 Webhook received at", new Date().toISOString());
  console.log("Raw request body length:", buf.length);
  console.log("stripe-signature header:", sig);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
    console.log("✅ Signature verified, event type:", event.type);
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log("💳 checkout.session.completed event:", session.id);
    console.log("Metadata on session:", session.metadata);

    const subjectUuid = session.metadata?.subjectUuid as string | undefined;
    const userId      = session.metadata?.userId as string | undefined;

    if (!subjectUuid || !userId) {
      console.error("⚠️ Missing subjectUuid or userId in metadata:", session.metadata);
      // Still return 200 so Stripe stops retrying, but do not attempt an insert
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // 2) Insert into Supabase
    try {
      console.log("→ Attempting to insert purchase row:", { subjectUuid, userId, sessionId: session.id });
      const { data, error } = await supabaseServer
        .from("purchases")
        .insert({
          subject_uuid: subjectUuid,
          user_id:       userId,
          stripe_session_id: session.id,
          amount:        session.amount_total,
          status:        "paid",
        });

      if (error) {
        console.error("❌ Supabase insert error:", error);
        // Return 200 anyway so Stripe does not retry endlessly
        return NextResponse.json({ received: true }, { status: 200 });
      }
      console.log("✅ Purchase recorded in Supabase:", data);
    } catch (dbErr: any) {
      console.error("❌ Unexpected DB error:", dbErr);
      return NextResponse.json({ received: true }, { status: 200 });
    }
  } else {
    console.log(`ℹ️ Received unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}