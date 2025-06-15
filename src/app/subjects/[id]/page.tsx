import { createSupabaseServerClient } from "@/lib/supabaseServer";
import Link from "next/link";
import Heading from "@/components/ui/Heading";
import Button from "@/components/ui/Button";
import { redirect } from "next/navigation";
import ProgressChart from "@/components/ProgressChart";
import { format, parseISO } from 'date-fns';

export default async function SubjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: subjectUuid } = await params;
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-grey">
        Please <Link href="/auth" className="text-teal underline">log in</Link> to view this page.
      </div>
    );
  }

  const { data: purchase } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", user.id)
    .eq("subject_uuid", subjectUuid)
    .eq("payment_confirmed", true)
    .maybeSingle();

  if (!purchase) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
        <div className="w-full max-w-md p-10 border rounded-lg shadow-lg text-center">
          <Link href="/home" className="block text-teal font-semibold hover:underline mb-6">← Back to Home</Link>
          <Heading level={2} className="mb-4">Access Denied</Heading>
          <p className="text-grey-light">You haven’t purchased this subject yet.</p>
          <Link href={`/buy/${subjectUuid}`}>
            <Button intent="primary" size="md" className="mt-6">Buy Now</Button>
          </Link>
        </div>
      </main>
    );
  }

  const { data: subject } = await supabase
    .from("subjects")
    .select("subject_name")
    .eq("uuid_id", subjectUuid)
    .maybeSingle();

  const { data: progressRow } = await supabase
    .from("user_subject_progress_view")
    .select("known_cards, total_cards")
    .eq("user_id", user.id)
    .eq("subject_uuid", subjectUuid)
    .maybeSingle();

  const progress = {
    known: progressRow?.known_cards ?? 0,
    total: progressRow?.total_cards ?? 0,
  };

  const { count: availableCount } = await supabase
    .from("flashcards")
    .select("uuid_id", { count: "exact", head: true })
    .eq("subject_uuid", subjectUuid);

  const { data: progressLog } = await supabase
    .from("user_subject_progress_log")
    .select("log_date, percent_known")
    .eq("user_id", user.id)
    .eq("subject_uuid", subjectUuid)
    .order("log_date", { ascending: true });

  const chartData = (progressLog || []).map((entry) => ({
    date: format(parseISO(entry.log_date), "MMM d"),
    percent: entry.percent_known,
  }));

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray">
      <div className="w-full max-w-md p-10 border rounded-lg shadow-lg text-center bg-white">
        <Link href="/home" className="block text-teal font-semibold hover:underline mb-6">← Back to Home</Link>
        <Heading level={1} className="mb-4">{subject?.subject_name}</Heading>
        <p className="text-lg text-grey mb-6">
          You’ve learned <span className="font-semibold">{progress.known}</span> of <span className="font-semibold">{availableCount}</span> cards.
        </p>
        <div className="space-y-4">
          <fieldset>
            <legend className="mb-6 font-semibold">How long do you want to study?</legend>
            <div className="space-y-2">
              <Link href={`/subjects/${subjectUuid}/study?limit=5`}>
                <Button intent="primary" size="md" className="w-half mb-4">Quick 5 (approx. 2 min)</Button>
              </Link>
              <Link href={`/subjects/${subjectUuid}/study?limit=20`}>
                <Button intent="secondary" size="md" className="w-half mb-4">Full Deck (approx. 10–15 min)</Button>
              </Link>
            </div>
          </fieldset>
        </div>
        <p className="text-xs text-grey-light text-center pt-2">Your cards will be personalized based on spaced repetition 🔁</p>

        <ProgressChart data={chartData} />
      </div>
    </main>
  );
}