// src/app/subjects/[id]/study/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/lib/useUser";
import Link from "next/link";
import Button from "@/components/ui/Button";

type Card = {
  uuid_id: string;
  question: string;
  answer: string;
};

export default function StudyPage() {
  const { id: subjectUuid } = useParams();
  const router = useRouter();
  const { user, loading } = useUser();

  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    async function checkAccessAndFetchCards() {
      if (!user || !subjectUuid) return;

      // 1) Check if user purchased
      const { data: purchase } = await supabase
        .from("purchases")
        .select("*")
        .eq("user_id", user.id)
        .eq("subject_uuid", subjectUuid)
        .eq("payment_confirmed", true)
        .maybeSingle();

      if (!purchase) {
        setUnauthorized(true);
        return;
      }

      // 2) Fetch all flashcards
      const { data, error } = await supabase
        .from("flashcards")
        .select("uuid_id, question, answer")
        .eq("subject_uuid", subjectUuid);

      if (!error && data) {
        setCards(data);
      }
    }

    if (!loading) checkAccessAndFetchCards();
  }, [user, loading, subjectUuid]);

  async function markProgress(status: boolean) {
    const {
      data: { user: supaUser },
    } = await supabase.auth.getUser();
    await supabase.from("user_progress").upsert({
      user_id: supaUser?.id,
      flashcard_uuid: cards[currentIndex].uuid_id,
      status,
    });

    setShowAnswer(false);
    setCurrentIndex((i) => i + 1);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-grey px-4">
        Checking access…
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
        <Link
          href="/home"
          className="text-teal font-semibold hover:underline mb-6"
        >
          ← Back to Home
        </Link>
        <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
        <p className="text-grey-light mb-4">You haven’t purchased this subject yet.</p>
        <Button
          intent="primary"
          size="md"
          onClick={() => router.push(`/buy/${subjectUuid}`)}
        >
          Buy Now
        </Button>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-grey px-4">
        Loading cards…
      </div>
    );
  }

  if (currentIndex >= cards.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
        <Link
          href="/home"
          className="text-teal font-semibold hover:underline mb-6"
        >
          ← Back to Home
        </Link>
        <h2 className="text-2xl font-semibold mb-2">
          🎉 You’ve completed all the cards!
        </h2>
        <p className="text-grey-light">
          Congratulations—keep practicing or explore other subjects.
        </p>
      </div>
    );
  }

  const card = cards[currentIndex];

  return (
    <main className="min-h-screen px-4 bg-white">
      <Link
        href="/home"
        className="text-teal font-semibold hover:underline fixed top-4 left-4"
      >
        EchoDeck
      </Link>

      <div className="mt-16 max-w-lg mx-auto p-6 border rounded-lg shadow-lg">
        <p className="text-xl font-medium text-navy">{card.question}</p>

        {showAnswer && (
          <p className="mt-4 text-lg font-semibold text-teal">{card.answer}</p>
        )}

        {!showAnswer && (
          <Button
            intent="secondary"
            size="sm"
            onClick={() => setShowAnswer(true)}
            className="mt-4"
          >
            Show Answer
          </Button>
        )}

        {showAnswer && (
          <div className="mt-6 flex justify-center gap-4">
            <Button intent="primary" size="md" onClick={() => markProgress(true)}>
              ✅ Know
            </Button>
            <Button
              intent="secondary"
              size="md"
              onClick={() => markProgress(false)}
            >
              ❌ Don’t Know
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}