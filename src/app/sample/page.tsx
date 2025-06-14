import SampleFlashcards from "@/components/SampleFlashcards";

export default function SamplePage() {
  return (
    <main className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-brand-navy">Try a Sample Deck 🎯</h1>
      <p className="mb-6 text-gray-600">
        Experience EchoDeck flashcards before signing up. No commitment — just learning.
      </p>
      <SampleFlashcards />
    </main>
  );
}