import { createSupabaseServerClient } from "@/lib/supabaseServer";
import Link from "next/link";
import Heading from "@/components/ui/Heading";
import Button from "@/components/ui/Button";

// Await the promise-wrapped `params` to satisfy Next.js 15 build constraints
export default async function SubjectDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: subjectUuid } = await params;

  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-grey">
        Please{" "}
        <Link href="/auth" className="text-teal underline">
          log in
        </Link>{" "}
        to view this page.
      </div>
    );
  }

  // 1. Check purchase
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
          <Link
            href="/home"
            className="block text-teal font-semibold hover:underline mb-6"
          >
            ← Back to Home
          </Link>
          <Heading level={2} className="mb-4">Access Denied</Heading>
          <p className="text-grey-light">
            You haven’t purchased this subject yet.
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

  // 2. Fetch subject name
  const { data: subject } = await supabase
    .from("subjects")
    .select("subject_name")
    .eq("uuid_id", subjectUuid)
    .maybeSingle();

  // 3. Fetch progress
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

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray">
      <div className="w-full max-w-md p-10 border rounded-lg shadow-lg text-center bg-white">
        <Link
          href="/home"
          className="block text-teal font-semibold hover:underline mb-6"
        >
          ← Back to Home
        </Link>
        <Heading level={1} className="mb-4">{subject?.subject_name}</Heading>
        <p className="text-lg text-grey mb-6">
          {progress.known} / {progress.total} cards learned
        </p>
        <Link href={`/subjects/${subjectUuid}/study`}>
          <Button intent="primary" size="md">Start Studying</Button>
        </Link>
      </div>
    </main>
  );
}