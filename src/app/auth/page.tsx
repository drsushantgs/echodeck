"use client";

import React, { useState } from "react";
import Image from "next/image";
import Heading from "@/components/ui/Heading";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);

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

        <form
          action={isSignUp ? "/auth/signup" : "/auth/signin"}
          method="POST"
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-grey mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full border p-2 rounded focus:ring focus:ring-teal-dark"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-grey mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              className="w-full border p-2 rounded focus:ring focus:ring-teal-dark"
              placeholder="••••••••"
            />
          </div>

          <Button intent="primary" size="md" className="w-full mb-4" type="submit">
            {isSignUp ? "Create Account" : "Log In"}
          </Button>
        </form>

        <p className="text-sm text-grey-light text-center">
          {isSignUp ? "Already have an account?" : "Don’t have an account yet?"}{" "}
          <button
            type="button"
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
