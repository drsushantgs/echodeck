"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/update`,
    });

    if (!error) setSubmitted(true);
    else alert("Error sending reset email. Please try again.");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-white text-center">
      <div className="w-full max-w-md bg-white shadow p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 text-brand-navy">Reset Password</h2>

        {submitted ? (
          <p className="text-grey mb-4">Check your inbox for a password reset link.</p>
        ) : (
          <>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            />
            <Button
              intent="primary"
              size="md"
              className="w-full"
              onClick={handleReset}
            >
              Send Reset Link
            </Button>
          </>
        )}

        <Link
          href="/auth"
          className="text-sm text-teal mt-6 inline-block hover:underline"
        >
          ← Back to Login
        </Link>
      </div>
    </main>
  );
}