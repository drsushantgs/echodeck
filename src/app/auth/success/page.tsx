// src/app/auth/success/page.tsx
import Link from "next/link";

export default function SignupSuccessPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-white text-center">
      <h1 className="text-2xl font-semibold mb-4 text-brand-navy">Check your email!</h1>
      <p className="text-grey mb-6">
        We’ve sent a confirmation link to your inbox. Click it to activate your EchoDeck account.
      </p>
      <Link href="/auth" className="text-teal font-semibold hover:underline">
        ← Back to login
      </Link>
    </main>
  );
}