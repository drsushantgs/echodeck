import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ConfidenceTile from "@/components/ConfidenceTile";

export default async function DashboardPage() {
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
          <Link href="/auth" className="inline-block bg-teal text-brand-coral px-6 py-2 rounded-full text-lg font-semibold hover:bg-teal-dark">🔐 Sign In</Link>
          <Link href="/auth/signup" className="inline-block border border-teal text-teal px-6 py-2 rounded-full text-lg font-semibold hover:bg-teal-light">✍️ Sign Up</Link>
        </div>
      </main>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, has_onboarded, exam_date, confidence_level, last_studied_subject_uuid, last_studied_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.has_onboarded) {
    redirect("/onboarding");
  }

  const { data: subjectsData } = await supabase
    .from("subjects")
    .select("uuid_id, subject_name");

  const { data: purchasesData } = await supabase
    .from("purchases")
    .select("subject_uuid")
    .eq("user_id", user.id)
    .eq("payment_confirmed", true);

  const { data: activityData } = await supabase
    .from("daily_activity")
    .select("cards_reviewed, goal_met")
    .eq("user_id", user.id)
    .eq("activity_date", new Date().toISOString().slice(0, 10))
    .single();

  const { data: profileData } = await supabase
    .from("profiles")
    .select("current_streak, daily_goal")
    .eq("id", user.id)
    .single();

  const purchasedUuids = (purchasesData || []).map((p) => p.subject_uuid);
  const purchasedSubjects = (subjectsData || []).filter((s) => purchasedUuids.includes(s.uuid_id));
  const lastStudiedSubject = purchasedSubjects.find(s => s.uuid_id === profile?.last_studied_subject_uuid) || null;
  const cardsReviewed = activityData?.cards_reviewed ?? 0;
  const goalMet = activityData?.goal_met ?? false;
  const streak = profileData?.current_streak ?? 0;
  const dailyGoal = profileData?.daily_goal ?? 10;
  const confidence = profile?.confidence_level ?? 0;
  const examDate = profile?.exam_date ? new Date(profile.exam_date) : null;
  const daysToGo = examDate ? Math.max(0, Math.ceil((examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : null;

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-brand-navy">
          Welcome back, Dr. {profile?.first_name ? ` ${profile.first_name}` : ""} 👋
        </h1>
        <form action="/auth/signout" method="POST">
          <Button intent="secondary" size="sm">Log Out</Button>
        </form>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-grey-200 rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-brand-navy">{streak}</p>
          <p className="text-sm text-gray-600">Day Streak 🔥</p>
        </div>
        <div className="bg-white border border-grey-200 rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-brand-navy">{cardsReviewed}/{dailyGoal}</p>
          <p className="text-sm text-gray-600">Cards Today</p>
        </div>
        <ConfidenceTile confidence={confidence} userId={user.id} />
        <div className="bg-white border border-grey-200 rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-brand-navy">{daysToGo ?? "?"}</p>
          <p className="text-sm text-gray-600">Days to Go</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-brand-navy mb-2">⭐ Starred Cards</h2>
        <Link href="/starred/study">
          <Button intent="primary" size="sm">Study Starred Cards</Button>
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-brand-navy mb-2">📚 Pick up where you left off</h2>
        {lastStudiedSubject ? (
          <Link href={`/subjects/${lastStudiedSubject.uuid_id}`}>
            <Card key={lastStudiedSubject.uuid_id}>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>{lastStudiedSubject.subject_name}</CardTitle>
                <Link href={`/subjects/${lastStudiedSubject.uuid_id}`}>
                  <Button intent="primary" size="sm">Study</Button>
                </Link>
              </CardHeader>
            </Card>
          </Link>
        ) : (
          <p className="text-grey-600">You haven’t studied any deck yet — let’s start one today!</p>
        )}
      </div>

      <h2 className="text-xl font-semibold text-brand-navy mb-3">Your Decks</h2>
      {purchasedSubjects.length === 0 ? (
        <p className="text-grey-600">You haven't bought any decks yet.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {purchasedSubjects.map((subject) => (
            <Card key={subject.uuid_id}>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>{subject.subject_name}</CardTitle>
                <Link href={`/subjects/${subject.uuid_id}`}>
                  <Button intent="primary" size="sm">Study</Button>
                </Link>
              </CardHeader>
            </Card>
          ))}
        </ul>
      )}

      <div className="text-center mt-10">
        <p className="text-sm text-grey-500">Want more decks?</p>
        <Link href="/catalog">
          <Button intent="secondary" size="sm" className="mt-2">Explore All Subjects</Button>
        </Link>
      </div>

      <footer className="text-xs text-grey-600 text-center mt-10">
        <Link href="/info" className="hover:underline">
          Terms &amp; Policies
        </Link>
      </footer>
    </main>
  );
}