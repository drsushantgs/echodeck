// src/app/success/page.tsx

import Link from "next/link";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-white">
      <h1 className="text-3xl font-bold mb-4 text-brand-navy">You're in. Let’s crush this. 💪</h1>
      <p className="text-lg text-gray-700 mb-4">
        You've unlocked a new subject. It’s ready when you are.
      </p>

      {session_id && (
        <p className="text-sm text-gray-400 mb-6">
          Session ID: {session_id}
        </p>
      )}

      <Link
        href="/home"
        className="text-teal font-semibold text-lg hover:underline"
      >
        → Back to Home & Start Studying
      </Link>
    </main>
  );
}