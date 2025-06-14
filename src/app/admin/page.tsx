"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";

export default function AdminLandingPage() {
  return (
    <main className="min-h-screen bg-brand-ivory p-8">
      <h1 className="text-2xl font-bold text-brand-navy mb-8">Admin Command Center</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow border p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold text-brand-navy mb-2">📬 Support Conversations</h2>
            <p className="text-sm text-grey mb-4">
              View feedback, respond to users, and resolve issues — all in one place.
            </p>
          </div>
          <Link href="/admin/feedback">
            <Button intent="primary">Go to Feedback</Button>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow border p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold text-brand-navy mb-2">📚 Deck Management</h2>
            <p className="text-sm text-grey mb-4">
              Add, edit, and expand flashcard decks for all subjects in the system.
            </p>
          </div>
          <Link href="/admin/decks">
            <Button intent="secondary">Manage Decks</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}