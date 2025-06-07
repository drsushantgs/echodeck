// src/app/buy/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Heading from "@/components/ui/Heading";
import Button from "@/components/ui/Button";
import Link from "next/link";

interface Subject {
  uuid_id: string;
  subject_name: string;
  price_pence: number;
}

export default function BuySubject() {
  const { id: subjectId } = useParams();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  useEffect(() => {
    async function fetchSubject() {
      const { data, error } = await supabase
        .from("subjects")
        .select("uuid_id, subject_name, price_pence")
        .eq("uuid_id", subjectId)
        .single();

      if (error) {
        console.error("Error fetching subject:", error);
        setSubject(null);
      } else {
        setSubject(data as Subject);
      }
    }
    fetchSubject();
  }, [subjectId]);

  const handleCheckout = async () => {
    setLoadingCheckout(true);

    // ─────────────────────────────────────────────────────────────────────────────
    // Make sure to include credentials so the Supabase cookies are sent:
    // ─────────────────────────────────────────────────────────────────────────────
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      credentials: "include", // ← send Supabase cookies
      body: JSON.stringify({ subjectUuid: subjectId }),
    });

    // Dump raw response for debugging
    const raw = await response.text();
    console.log("Raw response from checkout API:", raw);

    // Now attempt to parse JSON
    let data;
    try {
      data = JSON.parse(raw);
    } catch (parseErr) {
      console.error("Failed to parse JSON from /api/checkout:", parseErr);
      alert("Unexpected server response. Check console for details.");
      setLoadingCheckout(false);
      return;
    }

    if (data.url) {
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } else {
      console.error("Checkout error:", data.error);
      alert("There was an error processing your purchase. Please try again later.");
      setLoadingCheckout(false);
    }
  };

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-center px-4">
        <p>Loading subject information…</p>
      </div>
    );
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white border p-10 rounded-xl shadow-lg">
        <Link
          href="/home"
          className="block text-teal-600 font-semibold hover:underline mb-6"
        >
          ← Back to Home
        </Link>
        <Heading level={1} className="mb-6">
          {subject.subject_name}
        </Heading>

        <p className="text-gray-700 mb-8">
          Unlock full access to this subject’s flashcards and track your progress.
        </p>

        <p className="text-lg font-semibold mb-8">
          Price: £{(subject.price_pence / 100).toFixed(2)}
        </p>

        <Button
          intent="primary"
          className="w-full py-3 text-lg"
          onClick={handleCheckout}
          disabled={loadingCheckout}
        >
          {loadingCheckout ? "Redirecting..." : "Buy Now"}
        </Button>
      </div>
    </main>
  );
}
