// src/app/subjects/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";
import { useUser } from "@/lib/useUser";
import Link from "next/link";
import Heading from "@/components/ui/Heading";
import Button from "@/components/ui/Button";

export default function SubjectDetail() {
  const { id: subjectUuid } = useParams();
  const { user, loading } = useUser();

  const [progress, setProgress] = useState({ known: 0, total: 0 });
  const [unauthorized, setUnauthorized] = useState(false);
  const [subjectName, setSubjectName] = useState("");

  useEffect(() => {
    async function fetchData() {
      if (!user || !subjectUuid) return;

      // 1) Verify purchase
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

      // 2) Get subject name
      const { data: subject } = await supabase
        .from("subjects")
        .select("subject_name")
        .eq("uuid_id", subjectUuid)
        .maybeSingle();
      if (subject?.subject_name) {
        setSubjectName(subject.subject_name);
      }

      // 3) Get progress row
      const { data: progressRow } = await supabase
        .from("user_subject_progress_view")
        .select("known_cards, total_cards")
        .eq("user_id", user.id)
        .eq("subject_uuid", subjectUuid)
        .maybeSingle();
      if (progressRow) {
        setProgress({
          known: progressRow.known_cards,
          total: progressRow.total_cards,
        });
      }
    }

    if (!loading) fetchData();
  }, [user, loading, subjectUuid]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-grey">
        Checking your access…
      </div>
    );
  }

  if (unauthorized) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
        <div className="w-full max-w-md p-10 border rounded-lg shadow-lg text-center">
          <Link
            href="/home"
            className="block text-teal font-semibold hover:underline mb-6"
          >
            ← Back to Home
          </Link>
          <Heading level={2} className="mb-4">
            Access Denied
          </Heading>
          <p className="text-grey-light">
            You haven&apos;t purchased &quot;{subjectName}&quot; yet.
          </p>
          <Link href={`/buy/${subjectUuid}`}>
            <Button intent="primary" size="md" className="mt-6">
              Buy Now
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray">
      <div className="w-full max-w-md p-10 border rounded-lg shadow-lg text-center bg-white">
        <Link
          href="/home"
          className="block text-teal font-semibold hover:underline mb-6"
        >
          ← Back to Home
        </Link>
        <Heading level={1} className="mb-4">
          {subjectName}
        </Heading>
        <p className="text-lg text-grey mb-6">
          {progress.known} / {progress.total} cards learned
        </p>
        <Link href={`/subjects/${subjectUuid}/study`}>
          <Button intent="primary" size="md">
            Start Studying
          </Button>
        </Link>
      </div>
    </main>
  );
}