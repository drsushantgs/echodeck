"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

interface Card {
  uuid_id: string;
  question: string;
  answer: string;
  image_url?: string;
  video_url?: string;
  embed_html?: string;
  link_url?: string;
  bucket?: number;
  next_due_at?: string;
}

interface Props {
  userId: string;
  subjectUuid: string;
}

export default function StudyClient({ userId, subjectUuid }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [starredUuids, setStarredUuids] = useState<Set<string>>(new Set());

  useEffect(() => {
    const limitParam = parseInt(searchParams.get("limit") || "10");
    const limit = isNaN(limitParam) ? 10 : limitParam;

    async function fetchCards() {
      const { data, error } = await supabase.rpc("get_due_cards", {
        subject_uuid: subjectUuid,
        user_id: userId,
        limit_count: limit,
      });

      if (data && data.length > 0) {
        setCards(data);
      } else {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("flashcards")
          .select("uuid_id, question, answer, image_url, video_url, embed_html, link_url")
          .eq("subject_uuid", subjectUuid)
          .order("uuid_id", { ascending: true })
          .limit(limit);

        if (fallbackData) {
          setCards(fallbackData);
        }
      }
    }
    fetchCards();
  }, [subjectUuid, userId, searchParams]);

  async function fetchStarredFlashcards() {
    const { data, error } = await supabase
      .from("user_starred_flashcards")
      .select("flashcard_uuid")
      .eq("user_id", userId);

    if (data) {
      setStarredUuids(new Set(data.map((row) => row.flashcard_uuid)));
    }
  }

  async function rateCard(rating: "again" | "hard" | "easy") {
    const currentCard = cards[currentIndex];
    const now = new Date();

    const { data: progressData } = await supabase
      .from("user_progress")
      .select("bucket")
      .eq("user_id", userId)
      .eq("flashcard_uuid", currentCard.uuid_id)
      .single();

    const currentBucket = progressData?.bucket ?? 0;
    let newBucket = currentBucket;
    let nextDueAt: Date | null = null;

    if (rating === "again") {
      newBucket = 0;
      nextDueAt = new Date(now.getTime() + 10 * 60 * 1000);
    } else if (rating === "hard") {
      newBucket = currentBucket > 0 ? currentBucket : 1;
      nextDueAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    } else if (rating === "easy") {
      newBucket = Math.min(currentBucket + 1, 4);
      const days = [2, 4, 7, 14, 30][newBucket] || 30;
      nextDueAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    }

    if (!nextDueAt) return;

    await supabase.from("user_progress").upsert({
      user_id: userId,
      flashcard_uuid: currentCard.uuid_id,
      status: true,
      bucket: newBucket,
      last_reviewed_at: now.toISOString(),
      next_due_at: nextDueAt.toISOString(),
    }, {
      onConflict: "user_id,flashcard_uuid",
    });

    setShowAnswer(false);
    setCurrentIndex((i) => i + 1);
    setReviewedCount((r) => r + 1);
  }

  async function toggleStar(uuid: string) {
    const isStarred = starredUuids.has(uuid);

    if (isStarred) {
      await supabase
        .from("user_starred_flashcards")
        .delete()
        .eq("user_id", userId)
        .eq("flashcard_uuid", uuid);
    } else {
      await supabase.from("user_starred_flashcards").upsert({
        user_id: userId,
        flashcard_uuid: uuid,
      });
    }

    // Update local state
    setStarredUuids((prev) => {
      const updated = new Set(prev);
      isStarred ? updated.delete(uuid) : updated.add(uuid);
      return updated;
    });
  }

  function restartSession() {
    setCurrentIndex(0);
    setReviewedCount(0);
    setShowAnswer(false);
  }

  if (cards.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-grey px-4">Loading cards…</div>;
  }

  if (currentIndex >= cards.length) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white px-4 text-center">
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md border border-grey-300 space-y-6">
          <h2 className="text-2xl font-semibold text-brand-navy">Done! 🎯</h2>
          <p className="text-lg text-grey-700">You reviewed <span className="font-bold">{reviewedCount}</span> cards in this session.</p>
          <p className="text-md text-grey-700">That’s real progress. Keep going tomorrow to build your streak!</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <Button intent="primary" size="md" onClick={restartSession}>Study Again</Button>
            <Link href="/home"><Button intent="secondary" size="md">Return to Dashboard</Button></Link>
          </div>
        </div>
      </main>
    );
  }

  const card = cards[currentIndex];

  return (
    <main className="min-h-screen bg-brand-ivory px-4 pb-16 relative">
      <Link href="/home" className="text-teal font-semibold hover:underline fixed top-4 left-4">EchoDeck</Link>

      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-xl bg-white border border-grey-300 p-8 rounded-2xl shadow-lg text-center relative z-10">
          <div className="text-xl font-semibold text-brand-navy">{card.question}</div>

          {showAnswer ? (
            <>
              <div className="mt-6 text-lg text-brand-teal font-medium transition-opacity duration-300 animate-fade-in" dangerouslySetInnerHTML={{ __html: card.answer }} />
              {card.image_url && <img src={card.image_url} alt="Card Image" className="mt-4" />}
              {card.video_url && <video controls className="mt-4"><source src={card.video_url} type="video/mp4" /></video>}
              {card.embed_html && <div className="mt-4" dangerouslySetInnerHTML={{ __html: card.embed_html }} />}
              {card.link_url && <a href={card.link_url} className="mt-4 text-blue-500">Learn more</a>}
              <p className="mt-4 text-sm text-gray-500">{(() => {
                const b = card.bucket ?? 0;
                if (b === 0) return "Let’s make this one stick.";
                if (b === 1) return "You’re getting there!";
                if (b === 3) return "You’ve nearly mastered this.";
                if (b === 4) return "🔥 This one’s solid!";
                return "Keep going.";
              })()}</p>
            </>
          ) : (
            <Button intent="secondary" size="sm" onClick={() => setShowAnswer(true)} className="mt-6 animate-pulse">Show Answer</Button>
          )}

          {showAnswer && (
            <div className="mt-8 flex justify-center gap-4">
              <button
                className="absolute top-4 right-4 text-xl"
                onClick={() => toggleStar(card.uuid_id)}
              >
                {starredUuids.has(card.uuid_id) ? "⭐" : "☆"}
              </button>
              <Button onClick={() => rateCard("again")}>🔴 Again</Button>
              <Button onClick={() => rateCard("hard")}>🟡 Hard</Button>
              <Button onClick={() => rateCard("easy")}>🟢 Easy</Button>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full h-2 bg-grey-300 z-0">
        <div
          className="h-2 bg-brand-teal transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>
    </main>
  );
}