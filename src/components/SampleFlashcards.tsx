"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";

const sampleDeck = [
  {
    question: "What is the first step in managing anaphylaxis?",
    answer: "Administer intramuscular adrenaline 0.5mg (0.5mL of 1:1000).",
  },
  {
    question: "What is the maximum dose of Lidocaine with adrenaline for a 70kg adult?",
    answer: "7mg/kg → 490mg max (about 10mL of 2% lidocaine with 1:80,000 adrenaline).",
  },
  {
    question: "How do you manage a hypoglycemic episode in a conscious patient?",
    answer: "Give 15–20g of fast-acting carbohydrates — e.g. glucose tablets, sugary drink.",
  },
  {
    question: "Which antibiotic is recommended for dental infections in penicillin-allergic patients?",
    answer: "Clarithromycin 500mg twice daily for 5 days.",
  },
  {
    question: "What’s the emergency management of a suspected myocardial infarction?",
    answer: "Call 999, give aspirin 300mg (chewed), reassure, monitor vitals.",
  },
  {
    question: "What’s the maximum total dose of Articaine 4% in a 60kg adult?",
    answer: "7mg/kg → 420mg → approx. 5 cartridges (2.2mL per cartridge).",
  },
  {
    question: "When is Amoxicillin 3g used in dentistry?",
    answer: "As a single high dose for acute necrotising ulcerative gingivitis (ANUG).",
  },
  {
    question: "Name one common oral side effect of inhaled corticosteroids.",
    answer: "Oral candidiasis (thrush).",
  },
];

export default function SampleFlashcards() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [knownCount, setKnownCount] = useState(0);

  const card = sampleDeck[currentIndex];

  const handleNext = (knewIt: boolean) => {
    if (knewIt) setKnownCount((k) => k + 1);
    setShowAnswer(false);
    setCurrentIndex((i) => i + 1);
  };

  const restart = () => {
    setCurrentIndex(0);
    setKnownCount(0);
    setShowAnswer(false);
  };

  if (currentIndex >= sampleDeck.length) {
    const percent = Math.round((knownCount / sampleDeck.length) * 100);
    const emoji = percent === 100 ? "🎯" : percent > 80 ? "🔥" : "📚";

    return (
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-brand-navy">Nice work! {emoji}</h2>
        <p className="text-md text-gray-700">
          You knew <span className="font-bold">{knownCount}</span> of{" "}
          <span className="font-bold">{sampleDeck.length}</span> cards.
        </p>
        <p className="text-sm text-gray-500">Want to track your progress + unlock all decks?</p>
        <Link href="/auth/signup">
          <Button intent="primary" size="md">Create your free account</Button>
        </Link>
        <Button intent="secondary" size="sm" onClick={restart}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl bg-white border border-grey-300 p-8 rounded-2xl shadow-lg text-center mx-auto">
      <div className="text-xl font-semibold text-brand-navy">{card.question}</div>

      {showAnswer ? (
        <div className="mt-6 text-brand-teal font-medium text-lg transition-opacity duration-300">
          {card.answer}
        </div>
      ) : (
        <Button
          intent="secondary"
          size="sm"
          className="mt-6"
          onClick={() => setShowAnswer(true)}
        >
          Show Answer
        </Button>
      )}

      {showAnswer && (
        <div className="mt-8 flex justify-center gap-4">
          <Button intent="primary" size="md" onClick={() => handleNext(true)}>✅ Know</Button>
          <Button intent="secondary" size="md" onClick={() => handleNext(false)}>❌ Don’t Know</Button>
        </div>
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
  );
}