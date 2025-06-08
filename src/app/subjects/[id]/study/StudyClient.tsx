"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

type Card = {
  uuid_id: string;
  question: string;
  answer: string;
};

interface Props {
  userId: string;
  subjectUuid: string;
}

export default function StudyClient({ userId, subjectUuid }: Props) {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    async function fetchCards() {
      const { data, error } = await supabase
        .from("flashcards")
        .select("uuid_id, question, answer")
        .eq("subject_uuid", subjectUuid);

      if (!error && data) {
        setCards(data);
      }
    }

    fetchCards();
  }, [subjectUuid]);

  async function markProgress(status: boolean) {
    await supabase.from("user_progress").upsert({
      user_id: userId,
      flashcard_uuid: cards[currentIndex].uuid_id,
      status,
    });

    setShowAnswer(false);
    setCurrentIndex((i) => i + 1);
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
