"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Button from "@/components/ui/Button";

export default function OnboardingPage() {
  const router = useRouter();
  const [examDate, setExamDate] = useState("");
  const [confidence, setConfidence] = useState(5);
  const [dailyGoal, setDailyGoal] = useState(10);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    await supabase.from("profiles").update({
      has_onboarded: true,
      exam_date: new Date(examDate).toISOString().slice(0, 10),
      confidence_level: confidence,
      daily_goal: dailyGoal,
    }).eq("id", user.id);

    router.refresh();
    router.push("/home");
  }

  return (
    <main className="min-h-screen px-4 py-10 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold text-brand-navy mb-6">Let’s get you set up</h1>
      <form onSubmit={handleSubmit} className="space-y-6 text-left">
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            When is your next exam?
          </label>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-2">
            How confident do you feel about guidelines today? ({confidence}/10)
          </label>
          <input
            type="range"
            min={0}
            max={10}
            value={confidence}
            onChange={(e) => setConfidence(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Set a daily study goal (cards/day)
          </label>
          <input
            type="number"
            min={1}
            value={dailyGoal}
            onChange={(e) => setDailyGoal(parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded-lg p-2"
            required
          />
        </div>

        <div className="pt-4 text-center">
          <Button type="submit" size="md" intent="primary" disabled={loading}>
            {loading ? "Saving..." : "Finish Setup"}
          </Button>
        </div>
      </form>
    </main>
  );
}