// src/app/success/page.tsx

import Link from "next/link";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Payment Successful</h1>
      <p>
        Thank you for your purchase!
        {session_id && (
          <>
            <br />
            <span className="text-sm text-gray-600">
              Session ID: {session_id}
            </span>
          </>
        )}
      </p>
      <p className="mt-6">
        →{" "}
        <Link href="/home" className="text-teal hover:underline">
          Back to Home
        </Link>
      </p>
    </main>
  );
}