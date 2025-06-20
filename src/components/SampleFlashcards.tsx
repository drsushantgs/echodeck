"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import confetti from "canvas-confetti";

// Tutorial + Sample Cards
const sampleDeck = [
  {
    question: "Welcome to EchoDeck 🎓",
        answer:
      "In EchoDeck, you review a few cards at a time — just like this.<br /><br /> Tap any button below to continue.",
  },
  {
    question: "How do you study a card?",
        answer:
      "Flip the card. Then tell us how it felt:<br /><br />🔴 <b>Again</b> → You didn’t know it.<br />🟡 <b>Hard</b> → You sort of knew it, but hesitated.<br />🟢 <b>Easy</b> → You knew it instantly!",
  },
  {
    question: "Why spaced repetition?",
      answer: "Short sessions, done often, are proven to boost long-term memory.",
  },
  {
    question: "What is the first step in managing anaphylaxis?",
    answer: "Administer intramuscular adrenaline 0.5mg (0.5mL of 1:1000).",
  },
  {
    question: "What’s the maximum dose of Lidocaine with adrenaline for a 70kg adult?",
    answer: "7mg/kg → 490mg max (about 10mL of 2% lidocaine with 1:80,000 adrenaline).",
  },
  {
    question: "How do you manage a hypoglycemic episode in a conscious patient?",
    answer: "Give 15–20g of fast-acting carbohydrates — e.g. glucose tablets, sugary drink.",
  },
];

export default function SampleFlashcards() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const card = sampleDeck[currentIndex];

  const handleRate = (knewIt: boolean) => {
    if (knewIt) setKnownCount((k) => k + 1);
    setShowAnswer(false);
    setCurrentIndex((i) => i + 1);
  };

  const restart = () => {
    setCurrentIndex(0);
    setKnownCount(0);
    setShowAnswer(false);
    setShowConfetti(false);
  };

  useEffect(() => {
    if (currentIndex >= sampleDeck.length) {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
      });
      setShowConfetti(true);
    }
  }, [currentIndex]);

  if (currentIndex >= sampleDeck.length) {
    const percent = Math.round((knownCount / sampleDeck.length) * 100);
    const emoji = percent === 100 ? "🎯" : percent > 80 ? "🔥" : "📚";

    return (
      <main className="min-h-screen flex items-center justify-center bg-white px-4 text-center">
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md border border-grey-300 space-y-6">
          <h2 className="text-2xl font-semibold text-brand-navy">You're ready! {emoji}</h2>
          <p className="text-lg text-grey-700">
            You reviewed <span className="font-bold">{sampleDeck.length}</span> cards.
          </p>
          <p className="text-md text-grey-700">
            Create your free account to unlock full decks and save your progress.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <Link href="/auth/signup">
              <Button intent="primary" size="md">
                Create Free Account
              </Button>
            </Link>
            <Button intent="secondary" size="md" onClick={restart}>
              Try Again
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-ivory px-4 pb-16 flex items-center justify-center text-center">
      <div className="w-full max-w-xl bg-white border border-grey-300 p-8 rounded-2xl shadow-lg relative z-10">
        <div className="text-xl font-semibold text-brand-navy">{card.question}</div>

        {showAnswer ? (
          <>
            <div
              className="mt-6 text-lg text-brand-teal font-medium transition-opacity duration-300 animate-fade-in"
              dangerouslySetInnerHTML={{ __html: card.answer }}
            />
            <div className="mt-8 flex justify-center gap-4">
              <Button onClick={() => handleRate(false)}>🔴 Again</Button>
              <Button onClick={() => handleRate(false)}>🟡 Hard</Button>
              <Button onClick={() => handleRate(true)}>🟢 Easy</Button>
            </div>
          </>
        ) : (
          <Button
            intent="secondary"
            size="sm"
            onClick={() => setShowAnswer(true)}
            className="mt-6 animate-pulse"
          >
            Show Answer
          </Button>
        )}

        {/* Progress bar */}
        <div className="mt-6 h-2 bg-grey-300 rounded-full">
          <div
            className="h-2 bg-brand-teal rounded-full transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / sampleDeck.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </main>
  );
}