"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleUpdate = async () => {
    const { error } = await supabase.auth.updateUser({ password });
    if (!error) {
      alert("Password updated! Logging you in...");
      router.push("/home");
    } else {
      alert("Error updating password. Try again.");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-white text-center">
      <div className="w-full max-w-md bg-white shadow p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 text-brand-navy">Set New Password</h2>

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />

        <Button
          intent="primary"
          size="md"
          className="w-full"
          onClick={handleUpdate}
        >
          Update Password
        </Button>

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