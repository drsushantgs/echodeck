// src/app/auth/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import Heading from "@/components/ui/Heading";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    let error = null;
    if (isSignUp) {
      ({ error } = await supabase.auth.signUp({ email, password }));
    } else {
      ({ error } = await supabase.auth.signInWithPassword({ email, password }));
    }

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      if (isSignUp) {
        alert("Check your email to confirm your EchoDeck account!");
      } else {
        alert("Logged in to EchoDeck successfully!");
      }
      router.push("/home");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray">
      <div className="w-full max-w-md p-10 border rounded-lg shadow-lg bg-white">
        <Link href="/" className="image mb-6 flex justify-center">
          <Image
            src="/images/echodeck wordmark.png"
            alt="EchoDeck"
            width={800}
            height={200}
            priority
          />
        </Link>
        <Heading level={2} className="mb-6">
          {isSignUp ? "Create Your Account" : "Log In"}
        </Heading>

        <label className="block text-sm font-medium text-grey mb-1">Email</label>
        <input
          type="email"
          className="w-full border p-2 rounded mb-4 focus:ring focus:ring-teal-dark"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="block text-sm font-medium text-grey mb-1">Password</label>
        <input
          type="password"
          className="w-full border p-2 rounded mb-6 focus:ring focus:ring-teal-dark"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          intent="primary"
          size="md"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mb-4"
        >
          {loading
            ? "Please wait..."
            : isSignUp
            ? "Create Account"
            : "Log In"}
        </Button>

        <p className="text-sm text-grey-light text-center">
          {isSignUp
            ? "Already have an account?"
            : "Don’t have an account yet?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-teal font-semibold hover:underline"
          >
            {isSignUp ? "Log In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}