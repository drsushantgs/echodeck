// src/app/success/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [message, setMessage] = useState("Verifying payment...");

  useEffect(() => {
    if (!sessionId) {
      setMessage("No session ID provided.");
      return;
    }

    // Optionally, you can fetch session details from Stripe or your server
    // to verify, but since your webhook already recorded it in the DB,
    // you could simply say “Thank you.” If you want extra safety you could:
    //   fetch(`/api/checkout/verify?session_id=${sessionId}`)
    // and have that route check Stripe or your DB. For now, we'll just show a success.

    setMessage("Thank you for your purchase! Your session ID is " + sessionId);
  }, [sessionId]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Payment Successful</h1>
      <p>{message}</p>
      <p className="mt-6">
        → <a href="/home" className="text-teal hover:underline">Back to Home</a>
      </p>
    </main>
  );
}