// src/app/auth/success/page.tsx
import Link from "next/link";

export default function SignupSuccessPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-white text-center">
      <h1 className="text-3xl font-bold mb-4 text-brand-navy">You're almost in 🚀</h1>
      <p className="text-grey text-lg mb-6">
        We've sent a confirmation link to your inbox.<br />  
        Tap it to unlock your EchoDeck account and start mastering guidelines for ORE Part 2.
      </p>
      <p className="text-sm text-gray-500 mb-6">Didn’t get the email? Check spam or promotions tab.</p>
      <Link href="/auth" className="text-teal font-semibold hover:underline">
        ← Back to login
      </Link>
    </main>
  );
}