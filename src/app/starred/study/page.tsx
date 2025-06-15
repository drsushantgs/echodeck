// src/app/starred/study/page.tsx
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import StudyClient from "@/components/StudyClient";
import { redirect } from "next/navigation";

export default async function StarredStudyPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: starredRows, error } = await supabase
    .from("user_starred_flashcards")
    .select("flashcard_uuid")
    .eq("user_id", user.id);

  const starredUuids = starredRows?.map((row) => row.flashcard_uuid) ?? [];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      {starredUuids.length === 0 ? (
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-brand-navy mb-4">No Starred Cards</h1>
          <p className="text-grey-light mb-4">You haven’t starred any flashcards yet.</p>
          <a href="/home" className="text-teal underline">← Back to Dashboard</a>
        </div>
      ) : (
        <StudyClient
          userId={user.id}
          subjectUuid={null}
          customUuids={starredUuids}
        />
      )}
    </div>
  );
}