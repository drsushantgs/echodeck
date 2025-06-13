import Link from "next/link";

export default function StartHerePage() {
  return (
    <main className="min-h-screen px-6 py-10 max-w-2xl mx-auto text-gray-800">
      <h1 className="text-3xl font-bold mb-4 text-brand-navy">Welcome to EchoDeck 👋</h1>
      <p className="mb-6 text-lg">
        This guide will take you from zero to confident in under 60 seconds.
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Pick a subject 📚</h2>
          <p>
            From <Link href="/home" className="text-teal underline">your home screen</Link>, choose a topic you want to master. 
            Each subject is based on official guidelines — no fluff, just the core.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Start flashcards 🎯</h2>
          <p>
            Tap <span className="font-semibold">"Study"</span> to begin. You'll see a question — flip the card to see the answer, 
            and mark if you know it. This builds memory through active recall and spaced repetition.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Track your progress 📈</h2>
          <p>
            EchoDeck remembers what you've mastered and what needs review. Come back anytime to stay sharp.
            Every flashcard is a step closer to passing ORE Part 2.
          </p>
        </section>
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/home"
          className="inline-block bg-teal text-brand-teal px-6 py-3 rounded-full text-lg font-semibold hover:bg-teal-dark"
        >
          🚀 Take me to my flashcards
        </Link>
      </div>
    </main>
  );
}