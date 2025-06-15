"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";

export default function AdminLandingPage() {
  return (
    <main className="min-h-screen bg-brand-ivory p-8">
      <h1 className="text-2xl font-bold text-brand-navy mb-8">Admin Command Center</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow border p-6 flex flex-col justify-between hover:shadow-lg transition-shadow mb-4">
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

        <div className="bg-white rounded-xl shadow border p-6 flex flex-col justify-between hover:shadow-lg transition-shadow mb-4">
          <div>
            <h2 className="text-xl font-semibold text-brand-navy mb-2">✨ DeckCrafter</h2>
            <p className="text-sm text-grey mb-4">
              Create new flashcards with previews and shortcuts. Craft decks you'll love to study.
            </p>
          </div>
          <Link href="/admin/deckcrafter">
            <Button intent="secondary">Craft Flashcards</Button>
          </Link>
        </div>
      </div>

      <div className="mt-12 bg-white rounded-xl border p-6 shadow-inner text-center">
        <p className="text-sm text-grey mb-2">🎯 Daily Challenge</p>
        <h3 className="text-xl font-semibold text-brand-navy">Add 5 new flashcards today</h3>
        <p className="text-sm text-grey mt-2">Keep the streak alive. Your decks are your legacy.</p>
      </div>
    </main>
  );
}