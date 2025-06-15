import { createSupabaseServerClient } from "@/lib/supabaseServer";
import StudyClient from "@/components/StudyClient";

export default async function StarredDeckPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-8 text-center">Please log in to view your starred cards.</div>;
  }

  const { data: starred, error } = await supabase
    .from("user_starred_flashcards")
    .select("flashcard_uuid")
    .eq("user_id", user.id);

  const flashcardUuids = starred?.map((row) => row.flashcard_uuid) ?? [];

  return (
    <div className="min-h-screen bg-brand-ivory flex flex-col items-center justify-center px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">⭐ Your Starred Cards</h1>
      <StudyClient
        userId={user.id}
        subjectUuid={"starred"} // we'll pass a pseudo-subject
        customUuids={flashcardUuids}
      />
    </div>
  );
}