// src/app/subjects/[id]/study/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import StudyClient from "./StudyClient";

interface Props {
  params: { id: string };
}

export default async function StudyPage({ params }: Props) {
  const subjectUuid = params.id;
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  // 1. Check if user purchased this subject
  const { data: purchase } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", user.id)
    .eq("subject_uuid", subjectUuid)
    .eq("payment_confirmed", true)
    .maybeSingle();

  if (!purchase) redirect(`/subjects/${subjectUuid}`);

  return (
    <StudyClient userId={user.id} subjectUuid={subjectUuid} />
  );
}
