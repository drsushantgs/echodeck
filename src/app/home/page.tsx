"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/useUser";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface Subject {
  uuid_id: string;
  subject_name: string;
}

export default function HomePage() {
  const { user, loading } = useUser();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [purchases, setPurchases] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { supabase } = await import("@/lib/supabaseClient");

      const { data: subjectsData } = await supabase
        .from("subjects")
        .select("uuid_id, subject_name");
      setSubjects(subjectsData as Subject[] || []);

      if (user) {
        const { data: purchasesData } = await supabase
          .from("purchases")
          .select("subject_uuid")
          .eq("user_id", user.id)
          .eq("payment_confirmed", true);

        const purchasedIds = (purchasesData || []).map((p: { subject_uuid: string }) => p.subject_uuid);
        setPurchases(purchasedIds);
      }
    };

    if (!loading) fetchData();
  }, [user, loading]);

  if (loading) {
    return <div className="p-6 text-center text-grey-700">Loading EchoDeck...</div>;
  }

  return (
    <>
      <main className="px-6 sm:px-10 py-10 max-w-5xl mx-auto">
        {/* Top-right Log Out */}
        <div className="flex justify-end mt-4 mb-6">
          <Button
            intent="secondary"
            size="sm"
            onClick={async () => {
              const { supabase } = await import("@/lib/supabaseClient");
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
          >
            Log Out
          </Button>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl text-brand-navy text-center mb-8">
          Welcome to EchoDeck
        </h1>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-10">
          {subjects.map((subject) => {
            const isPurchased = purchases.includes(subject.uuid_id);
            return (
              <Card key={subject.uuid_id}>
                <CardHeader className="flex justify-between items-center">
                  <CardTitle>{subject.subject_name}</CardTitle>

                  <Link
                    href={
                      isPurchased
                        ? `/subjects/${subject.uuid_id}`
                        : `/buy/${subject.uuid_id}`
                    }
                  >
                    <Button intent={isPurchased ? "primary" : "secondary"} size="md">
                      {isPurchased ? "Study" : "Buy"}
                    </Button>
                  </Link>
                </CardHeader>
              </Card>
            );
          })}
        </ul>
      </main>

      {/* Footer with legal link */}
      <footer className="text-xs text-grey-700 text-center py-6">
        <Link href="/info" className="hover:underline">
          Terms &amp; Policies
        </Link>
      </footer>
    </>
  );
}
