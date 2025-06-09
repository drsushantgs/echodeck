// src/app/buy/[id]/page.tsx
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";

interface Props {
  params: { id: string };
}

export default async function BuyPage({ params: { id } }: Props) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data: subject, error } = await supabase
    .from("subjects")
    .select("uuid_id, subject_name, price_pence")
    .eq("uuid_id", id)
    .maybeSingle();

  if (!subject || error) {
    return (
      <main className="min-h-screen flex items-center justify-center text-center text-gray-600 px-4">
        <p>Sorry, that subject doesn't exist or couldn’t be loaded.</p>
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white border p-10 rounded-xl shadow-lg">
        <Link href="/home" className="block text-teal-600 font-semibold hover:underline mb-6">
          ← Back to Home
        </Link>

        <Heading level={1} className="mb-6">
          {subject.subject_name}
        </Heading>

        <p className="text-gray-700 mb-8">
          Unlock full access to this subject’s flashcards and track your progress.
        </p>

        <p className="text-lg font-semibold mb-8">
          Price: £{(subject.price_pence / 100).toFixed(2)}
        </p>

        <form method="POST" action="/api/checkout">
          <input type="hidden" name="subjectUuid" value={subject.uuid_id} />
          <Button intent="primary" className="w-full py-3 text-lg" type="submit">
            Buy Now
          </Button>
        </form>
      </div>
    </main>
  );
}