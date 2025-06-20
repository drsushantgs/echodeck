// src/components/StudyClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

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

interface PowerTip {
  id: number;
  message: string;
}

interface Props {
  userId: string;
  subjectUuid?: string | null;
  customUuids?: string[];
}

export default function StudyClient({ userId, subjectUuid, customUuids }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [starredUuids, setStarredUuids] = useState<Set<string>>(new Set());
  const [powerTip, setPowerTip] = useState<PowerTip | null>(null);
  const [showHomeScreenPrompt, setShowHomeScreenPrompt] = useState(false);
  const [showIosBanner, setShowIosBanner] = useState(false);

  useEffect(() => {
    const limitParam = parseInt(searchParams.get("limit") || "10");
    const limit = isNaN(limitParam) ? 10 : limitParam;

    async function fetchCards() {
      if (customUuids && customUuids.length > 0) {
        const { data } = await supabase
          .from("flashcards")
          .select("uuid_id, question, answer, image_url, video_url, embed_html, link_url")
          .in("uuid_id", customUuids)
          .order("uuid_id", { ascending: true })
          .limit(limit);

        if (data) setCards(data);
        return;
      }

      if (subjectUuid) {
        const { data } = await supabase.rpc("get_due_cards", {
          subject_uuid: subjectUuid,
          user_id: userId,
          limit_count: limit,
        });

        if (data && data.length > 0) {
          setCards(data);
        } else {
          const { data: fallbackData } = await supabase
            .from("flashcards")
            .select("uuid_id, question, answer, image_url, video_url, embed_html, link_url")
            .eq("subject_uuid", subjectUuid)
            .order("uuid_id", { ascending: true })
            .limit(limit);

          if (fallbackData) setCards(fallbackData);
        }
      }
    }

    fetchCards();
    fetchStarredFlashcards();

    // Detect iOS and show custom install banner, only if not previously dismissed/installed
    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator.standalone);

    if (isIos && !isInStandaloneMode) {
      (async () => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("home_screen_ios_prompt_status")
          .eq("id", userId)
          .single();

        if (!profile?.home_screen_ios_prompt_status) {
          setShowIosBanner(true);
        }
      })();
    }
  }, [subjectUuid, customUuids, userId, searchParams]);

  async function fetchStarredFlashcards() {
    const { data } = await supabase
      .from("user_starred_flashcards")
      .select("flashcard_uuid")
      .eq("user_id", userId);

    if (data) {
      setStarredUuids(new Set(data.map((row) => row.flashcard_uuid)));
    }
  }

  async function updateStreakAndActivity(cardCount: number) {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const yesterdayStr = new Date(today.getTime() - 86400000).toISOString().slice(0, 10);

    const { data: existing } = await supabase
      .from("daily_activity")
      .select("cards_reviewed, goal_met")
      .eq("user_id", userId)
      .eq("activity_date", todayStr)
      .single();

    const newCount = (existing?.cards_reviewed ?? 0) + cardCount;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("daily_goal, current_streak, last_study_date")
      .eq("id", userId)
      .single();

    const dailyGoal = profileData?.daily_goal ?? 10;
    const prevStreak = profileData?.current_streak ?? 0;
    const goalMet = newCount >= dailyGoal;
    const lastStudyDate = profileData?.last_study_date;

    await supabase.from("daily_activity").upsert({
      user_id: userId,
      activity_date: todayStr,
      cards_reviewed: newCount,
      goal_met: goalMet,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id,activity_date"
    });

    if (!existing?.goal_met && goalMet) {
      toast.success("🏆 Daily goal met!", { duration: 4000 });
    }

    const { data: yesterday } = await supabase
      .from("daily_activity")
      .select("activity_date")
      .eq("user_id", userId)
      .eq("activity_date", yesterdayStr)
      .single();

    if (lastStudyDate !== todayStr) {
      const newStreak = yesterday ? prevStreak + 1 : 1;

      await supabase.from("profiles").update({
        current_streak: newStreak,
        last_study_date: todayStr,
      }).eq("id", userId);

      toast.success(`🔥 ${newStreak}-day streak!`, {
        duration: 4000,
      });
    }
  }

  async function updateSessionsCompletedAndMaybePrompt() {
    const { data: profile } = await supabase
      .from("profiles")
      .select("sessions_completed, home_screen_prompt_status")
      .eq("id", userId)
      .single();

    const sessionsCompleted = (profile?.sessions_completed ?? 0) + 1;
    const promptStatus = profile?.home_screen_prompt_status;

    await supabase
      .from("profiles")
      .update({
        sessions_completed: sessionsCompleted,
        home_screen_prompt_last_shown_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (sessionsCompleted >= 3 && !promptStatus) {
      setShowHomeScreenPrompt(true);
    }
  }

  async function handleDismissIosBanner() {
    await supabase
      .from("profiles")
      .update({
        home_screen_ios_prompt_status: "dismissed",
        home_screen_ios_prompt_last_shown_at: new Date().toISOString(),
      })
      .eq("id", userId);

    setShowIosBanner(false);
  }

  async function handleInstalledIosBanner() {
    await supabase
      .from("profiles")
      .update({
        home_screen_ios_prompt_status: "installed",
        home_screen_ios_prompt_last_shown_at: new Date().toISOString(),
      })
      .eq("id", userId);

    setShowIosBanner(false);
  }

  async function loadPowerTip() {
    const { data, error } = await supabase
      .from("power_tips")
      .select("*")
      .order("RANDOM()")
      .limit(1)
      .single();

    if (data) setPowerTip(data);
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

    const todayStr = new Date().toISOString().slice(0, 10);
    const { data: activityToday } = await supabase
      .from("daily_activity")
      .select("cards_reviewed")
      .eq("user_id", userId)
      .eq("activity_date", todayStr)
      .single();

    const reviewedToday = (activityToday?.cards_reviewed ?? 0) + 1;

    setShowAnswer(false);
    setCurrentIndex((i) => i + 1);
    setReviewedCount((r) => r + 1);

    if (reviewedToday % 7 === 0) {
      await loadPowerTip();
    }

    // Log progress snapshot for this subject today
    if (subjectUuid && userId) {
      const todayStr = new Date().toISOString().slice(0, 10);

      // Step 1: Get all flashcard UUIDs for the subject
      const { data: subjectCards, error: cardErr } = await supabase
        .from("flashcards")
        .select("uuid_id")
        .eq("subject_uuid", subjectUuid);

      if (cardErr) {
        console.error("❌ Error fetching subject cards", cardErr);
        return;
      }

      const flashcardUuids = (subjectCards || []).map((c) => c.uuid_id);

      if (flashcardUuids.length === 0) {
        console.warn("⚠️ No flashcards found for subject, skipping progress log");
        return;
      }

      let known = 0;
      const { count: knownCount, error: knownErr } = await supabase
        .from("user_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .in("bucket", [2, 3, 4])
        .in("flashcard_uuid", flashcardUuids);

      if (knownErr) {
        console.error("❌ Error fetching known count", knownErr);
        return;
      }

      known = knownCount ?? 0;

      const { count: total, error: totalErr } = await supabase
        .from("flashcards")
        .select("*", { count: "exact", head: true })
        .eq("subject_uuid", subjectUuid);

      if (totalErr) {
        console.error("❌ Error fetching total count", totalErr);
        return;
      }

      if (total === null || known === null) {
        console.warn("⚠️ Invalid known/total counts, skipping log");
        return;
      }

      const percentKnown = Math.round((known / total) * 10000) / 100;

      const { error: upsertErr } = await supabase.from("user_subject_progress_log").upsert({
        user_id: userId,
        subject_uuid: subjectUuid,
        log_date: todayStr,
        known_cards: known,
        total_cards: total,
      }, {
        onConflict: "user_id,subject_uuid,log_date"
      });

      if (upsertErr) {
        console.error("❌ Failed to upsert progress log", upsertErr);
      } else {
        console.log("✅ Logged user_subject_progress snapshot", {
          known,
          total,
          percentKnown
        });
      }

      // Update user's last studied subject and timestamp
      await supabase.from("profiles").update({
        last_studied_subject_uuid: subjectUuid,
        last_studied_at: new Date().toISOString(),
      }).eq("id", userId);
    }
  }

  useEffect(() => {
    if (currentIndex === cards.length && reviewedCount > 0) {
      updateStreakAndActivity(reviewedCount);
      updateSessionsCompletedAndMaybePrompt();
    }
  }, [currentIndex, cards.length, reviewedCount]);

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

  async function handleDismissHomeScreenPrompt() {
    await supabase
      .from("profiles")
      .update({
        home_screen_prompt_status: "dismissed",
        home_screen_prompt_last_shown_at: new Date().toISOString(),
      })
      .eq("id", userId);

    setShowHomeScreenPrompt(false);
  }

  async function handleInstalledHomeScreenPrompt() {
    await supabase
      .from("profiles")
      .update({
        home_screen_prompt_status: "installed",
        home_screen_prompt_last_shown_at: new Date().toISOString(),
      })
      .eq("id", userId);

    setShowHomeScreenPrompt(false);
  }

  if (cards.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-grey px-4">Loading cards…</div>;
  }

  if (powerTip) {
    return (
      <main className="min-h-screen bg-yellow-50 px-4 pb-16 flex items-center justify-center text-center">
        <div className="w-full max-w-md bg-white border border-yellow-300 p-8 rounded-2xl shadow-md space-y-6">
          <h2 className="text-2xl font-bold text-yellow-700">🎁 Power Tip</h2>
          <p className="text-md text-yellow-800">{powerTip.message}</p>
          <Button intent="primary" onClick={() => {
            setPowerTip(null);
            setCurrentIndex((i) => i + 1);
          }}>Continue</Button>
        </div>
      </main>
    );
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
        {showHomeScreenPrompt && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white border border-grey-300 shadow-xl px-6 py-4 rounded-xl z-50 w-[90%] max-w-md space-y-3 text-center">
            <h3 className="text-lg font-bold text-brand-navy">📲 Add EchoDeck to your Home Screen</h3>
            <p className="text-sm text-grey-700">You can launch EchoDeck faster next time — no browser needed!</p>
            <div className="flex justify-center gap-4 pt-2">
              <Button intent="secondary" size="sm" onClick={() => handleDismissHomeScreenPrompt()}>Dismiss</Button>
              <Button intent="primary" size="sm" onClick={() => handleInstalledHomeScreenPrompt()}>Got it!</Button>
            </div>
          </div>
        )}
        {showIosBanner && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-purple-100 border border-purple-300 shadow-xl px-6 py-4 rounded-xl z-50 w-[90%] max-w-md space-y-3 text-center">
            <h3 className="text-md font-bold text-purple-800">
              📲 Install EchoDeck on your iPhone
            </h3>
            <p className="text-sm text-purple-700">
              Tap <span className="inline-block"> <svg xmlns="http://www.w3.org/2000/svg" className="inline h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v12m0 0l-4-4m4 4l4-4m0 4H8a4 4 0 01-4-4V7a4 4 0 014-4h8a4 4 0 014 4v4"/></svg> </span> then &quot;Add to Home Screen&quot;
            </p>
            <div className="flex justify-center pt-2">
              <Button intent="secondary" size="sm" onClick={() => handleDismissIosBanner()}>
                Dismiss
              </Button>
            </div>
          </div>
        )}
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