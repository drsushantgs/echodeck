import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ClientWelcomeToast from "@/components/ClientWelcomeToast";

interface Subject {
  uuid_id: string;
  subject_name: string;
}

export default async function HomePage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-10">
      <h1 className="text-2xl font-bold text-brand-navy mb-4">Hold up — you're not logged in</h1>
      <p className="text-gray-700 mb-6">
        EchoDeck remembers your progress, flashcards, and purchases.  
        Sign in to unlock your study decks.
      </p>
      <div className="space-x-4">
        <Link
          href="/auth"
          className="inline-block bg-teal text-brand-coral px-6 py-2 rounded-full text-lg font-semibold hover:bg-teal-dark"
        >
          🔐 Sign In
        </Link>
        <Link
          href="/auth"
          className="inline-block border border-teal text-teal px-6 py-2 rounded-full text-lg font-semibold hover:bg-teal-light"
        >
          ✍️ Sign Up
        </Link>
      </div>
    </main>
    );
  }

  const { data: subjectsData } = await supabase
    .from("subjects")
    .select("uuid_id, subject_name");

  const subjects: Subject[] = subjectsData || [];

  const { data: purchasesData } = await supabase
    .from("purchases")
    .select("subject_uuid")
    .eq("user_id", user.id)
    .eq("payment_confirmed", true);

  const purchases = (purchasesData || []).map((p) => p.subject_uuid);

  return (
    <>
      <main className="px-6 sm:px-10 py-10 max-w-5xl mx-auto">
        <div className="flex justify-end mt-4 mb-6">
          <form action="/auth/signout" method="POST">
            <Button intent="secondary" size="sm" type="submit">
              Log Out
            </Button>
          </form>
        </div>

        <ClientWelcomeToast />

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

      <footer className="text-xs text-grey-700 text-center py-6">
        <Link href="/info" className="hover:underline">
          Terms &amp; Policies
        </Link>
      </footer>
    </>
  );
}
