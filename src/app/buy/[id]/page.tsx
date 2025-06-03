// src/app/buy/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Heading from "@/components/ui/Heading";
import Button from "@/components/ui/Button";
import Link from "next/link";

interface Subject {
  uuid_id: string;
  subject_name: string;
}

export default function BuySubject() {
  const { id: subjectId } = useParams();
  const [subject, setSubject] = useState<Subject | null>(null);

  useEffect(() => {
    async function fetchSubject() {
      const { data } = await supabase
        .from("subjects")
        .select("uuid_id, subject_name")
        .eq("uuid_id", subjectId)
        .single();

      setSubject(data as Subject | null);
    }
    fetchSubject();
  }, [subjectId]);

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center text-grey text-center px-4">
        <p>Loading subject information…</p>
      </div>
    );
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white border p-10 rounded-xl shadow-1g">
        <Link
          href="/home"
          className="block text-teal font-semibold hover:underline mb-6"
        >
          ← Back to Home
        </Link>
        <Heading level={1} className="mb-6">
            {subject.subject_name}
        </Heading>

        <p className="text-gray-700 mb-8">
          Unlock full access to this subject’s flashcards and track your progress.
        </p>

        <p className="text-lg font-semibold mb-8">Price: £3.99</p>

        <Button
          intent="primary"
          className="w-full py-3 text-lg"
          onClick={() => alert('Stripe Checkout coming soon!')}
        >
          Buy with Stripe
        </Button>
      </div>
     </main>
  );
}