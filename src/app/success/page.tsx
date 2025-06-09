// src/app/success/page.tsx
import { cookies } from "next/headers";

export default function SuccessPage({ searchParams }: { searchParams: { session_id?: string } }) {
  const sessionId = searchParams.session_id;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Payment Successful</h1>
      <p>
        Thank you for your purchase!
        {sessionId && <><br /><span className="text-sm text-gray-600">Session ID: {sessionId}</span></>}
      </p>
      <p className="mt-6">
        → <a href="/home" className="text-teal hover:underline">Back to Home</a>
      </p>
    </main>
  );
}