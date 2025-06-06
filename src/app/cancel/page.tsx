// src/app/cancel/page.tsx
"use client";

export default function CancelPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Payment Canceled</h1>
      <p>
        You canceled the checkout. If you changed your mind, you can still
        purchase by clicking the Buy button again.
      </p>
      <p className="mt-6">
        → <a href="/home" className="text-teal hover:underline">Back to Home</a>
      </p>
    </main>
  );
}