"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Heading from "@/components/ui/Heading";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function AuthClient() {
  const pathname = usePathname();
  const router = useRouter();

  const isSignupPath = pathname === "/auth/signup";
  const [isSignUp, setIsSignUp] = useState(isSignupPath);
  const [firstName, setFirstName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  useEffect(() => {
    setIsSignUp(isSignupPath);
    setPasswordError("");
    setConfirmPassword("");
    setConfirmError("");
    setPassword("");
  }, [isSignupPath]);

  function validatePassword(password: string): string {
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) return "Password should contain at least one special character.";
    return "";
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (!isSignUp) return;

    const error = validatePassword(password);
    if (error) {
      event.preventDefault();
      setPasswordError(error);
      setConfirmError("");
      return;
    }

    if (password !== confirmPassword) {
      event.preventDefault();
      setPasswordError("");
      setConfirmError("Passwords do not match.");
      return;
    }

    setPasswordError("");
    setConfirmError("");
  }

  function handleToggle() {
    const newPath = isSignUp ? "/auth" : "/auth/signup";
    router.push(newPath);
  }

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
          {isSignUp ? "Create Your Account" : "Welcome Back, future GDC Registrant!"}
        </Heading>

        <p className="text-sm text-grey-light text-center pt-2">
          {"Let's get you closer to the finish line"}
        </p>

        <form
          action={isSignUp ? "/auth/signup/submit" : "/auth/signin"}
          method="POST"
          className="space-y-6"
          onSubmit={handleSubmit}
        >
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-grey mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border p-2 rounded focus:ring focus:ring-teal-dark"
                placeholder="Your first name"
              />
            </div>
          )}

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
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (confirmPassword.length > 0) {
                  setConfirmError(e.target.value === confirmPassword ? "" : "Passwords do not match.");
                }
              }}
              className="w-full border p-2 rounded focus:ring focus:ring-teal-dark"
              placeholder="••••••••"
            />
            {passwordError && (
              <p className="mt-1 text-xs text-red-600">{passwordError}</p>
            )}
          </div>

          {isSignUp && (
            <>
              <div className="mt-1 text-xs text-grey-light">
                <p>Your password must be at least 8 characters long.</p>
                <p>It should include:</p>
                <p>🔘 One capital letter</p>
                <p>🔘 One small letter</p>
                <p>🔘 One number</p>
                <p>🔘 One special character</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-grey mb-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    const value = e.target.value;
                    setConfirmPassword(value);
                    setConfirmError(value === password ? "" : "Passwords do not match.");
                  }}
                  className="w-full border p-2 rounded focus:ring focus:ring-teal-dark"
                  placeholder="••••••••"
                />
                {confirmPassword.length > 0 && (
                  <p className={`mt-1 text-xs ${confirmError ? "text-red-600" : "text-green-600"}`}>
                    {confirmError || "✅ Passwords match."}
                  </p>
                )}
              </div>
            </>
          )}

          <Button intent="primary" size="md" className="w-full mb-4" type="submit">
            {isSignUp ? "Create Account" : "Log In"}
          </Button>
        </form>

        <p className="text-sm text-grey-light text-center pt-2">
          {isSignUp ? "Already have an account?" : "Don't have an account yet?"}{" "}
          <button
            type="button"
            onClick={handleToggle}
            className="text-teal font-semibold hover:underline"
          >
            {isSignUp ? "Log In" : "Sign Up. It’s free!"}
          </button>
        </p>

        <p className="text-sm text-grey-light text-center mt-2">
          <Link href="/auth/reset" className="text-teal hover:underline">
            Forgot your password?
          </Link>
        </p>
      </div>
    </div>
  );
}