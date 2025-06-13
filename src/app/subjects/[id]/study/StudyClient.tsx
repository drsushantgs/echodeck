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
  image_url?: string; // Optional image URL
  video_url?: string; // Optional video URL
  embed_html?: string; // Optional embed HTML
  link_url?: string; // Optional link URL
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
  const [knownCount, setKnownCount] = useState(0);
  const [dontKnowCount, setDontKnowCount] = useState(0);

  useEffect(() => {
    async function fetchCards() {
      const { data, error } = await supabase
        .from("flashcards")
        .select("uuid_id, question, answer, image_url, video_url, embed_html, link_url")
        .eq("subject_uuid", subjectUuid);

      if (!error && data) {
        setCards(data);
      }
    }

    fetchCards();
  }, [subjectUuid]);

  const session = supabase.auth.getSession();
  console.log("Current user session:", session);

  async function markProgress(status: boolean) {
  const { data, error } = await supabase.from("user_progress").upsert(
    {
      user_id: userId,
      flashcard_uuid: cards[currentIndex].uuid_id,
      status,
    },
    {
      onConflict: 'user_id,flashcard_uuid', // Prevent duplicates
    }
  );

    if (error) {
      console.error("Error updating user progress:", error);
    } else {
      console.log("User progress updated:", data);
    }

    if (status) {
      setKnownCount((k) => k + 1);
    } else {
      setDontKnowCount((d) => d + 1);
    }

    setShowAnswer(false);
    setCurrentIndex((i) => i + 1);
  }

  function restartSession() {
    setCurrentIndex(0);
    setKnownCount(0);
    setDontKnowCount(0);
    setShowAnswer(false);
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-grey px-4">
        Loading cards…
      </div>
    );
  }

  if (currentIndex >= cards.length) {
    const total = knownCount + dontKnowCount || cards.length;
    const percent = Math.round((knownCount / total) * 100);
    let emoji = "🙂";
    if (percent === 100) emoji = "🎯";
    else if (percent >= 80) emoji = "🔥";
    else if (percent >= 60) emoji = "💪";
    else if (percent >= 40) emoji = "📚";
    else emoji = "🤔";

    return (
      <main className="min-h-screen flex items-center justify-center bg-white px-4 text-center">
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md border border-grey-300 space-y-6">
          <h2 className="text-2xl font-semibold text-brand-navy">
            Done! {emoji}
          </h2>

          <p className="text-lg text-grey-700">
            That's  <span className="font-bold">{knownCount}</span> out of{" "}
            <span className="font-bold">{total}</span> cards {" "}
            <span className="text-brand-teal">stronger</span>.
          </p>

          <p className="text-md text-grey-700">
            Your success rate:{" "}
            <span className="font-semibold text-brand-teal">{percent}%</span>
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <Button intent="primary" size="md" onClick={restartSession}>
              Study Again to Lock it In
            </Button>

            <Link href="/home">
              <Button intent="secondary" size="md">Return to Dashboard</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const card = cards[currentIndex];

  return (
    <main className="min-h-screen bg-brand-ivory px-4 pb-16 relative">
      {/* Sticky EchoDeck link */}
      <Link
        href="/home"
        className="text-teal font-semibold hover:underline fixed top-4 left-4"
      >
        EchoDeck
      </Link>

      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-xl bg-white border border-grey-300 p-8 rounded-2xl shadow-lg text-center relative z-10">
          <div className="text-xl font-semibold text-brand-navy">
            {card.question}
          </div>

          {showAnswer ? (
            <>
              <div className="mt-6 text-lg text-brand-teal font-medium transition-opacity duration-300"
                dangerouslySetInnerHTML={{ __html:card.answer }}
              />
              {card.image_url && (
                <img src={card.image_url} alt="Card Image" className="mt-4" />
              )}
              {card.video_url && (
                <video controls className="mt-4">
                  <source src={card.video_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
              {card.embed_html && (
                <div
                  className="mt-4"
                  dangerouslySetInnerHTML={{ __html: card.embed_html }}
                />
              )}
              {card.link_url && (
                <a href={card.link_url} className="mt-4 text-blue-500">
                  Learn more
                </a>
              )}
            </>
          ) : (
            <Button
              intent="secondary"
              size="sm"
              onClick={() => setShowAnswer(true)}
              className="mt-6"
            >
              Show Answer
            </Button>
          )}

          {showAnswer && (
            <div className="mt-8 flex justify-center gap-4">
              <Button intent="primary" size="md" onClick={() => markProgress(true)}>
                ✅ Know
              </Button>
              <Button
                intent="secondary"
                size="md"
                onClick={() => markProgress(false)}
              >
                ❌ Don&apos;t Know
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="fixed bottom-0 left-0 w-full h-2 bg-grey-300 z-0">
        <div
          className="h-2 bg-brand-teal transition-all duration-300"
          style={{
            width: `${((currentIndex + 1) / cards.length) * 100}%`,
          }}
        />
      </div>
    </main>
  );
}