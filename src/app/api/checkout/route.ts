import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import Stripe from "stripe";
import { getUserIdFromRequest } from "@/lib/supabaseServer";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing Stripe secret key");
  // Use a standard API version or omit it if you’re not sure
  return new Stripe(key);
};

export async function POST(req: NextRequest) {
  let payload: { subjectUuid?: string };
  try {
    payload = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const subjectUuid = payload.subjectUuid;
  if (!subjectUuid) {
    return NextResponse.json({ error: "Missing subject UUID." }, { status: 400 });
  }

 // 2) Look up the subject in Supabase, including its stripe_price_id
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

  // 3) Get the logged-in user's ID from the request
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  // 3) Initialize Stripe
  let stripe: Stripe;
  try {
    stripe = getStripe();
  } catch (stripeInitErr: any) {
    console.error("Stripe init error:", stripeInitErr.message);
    return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 });
  }

   // 5) Create the Checkout Session, including both subjectUuid and userId in metadata
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
        subjectUuid,   // existing metadata
        userId,        // new metadata for who is buying
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