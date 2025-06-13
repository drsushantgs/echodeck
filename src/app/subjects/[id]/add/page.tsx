import AddFlashcard from "@/components/AddFlashcard";

export default function AddFlashcardPage({ params }: { params: { id: string } }) {
  return <AddFlashcard subjectUuid={params.id} />;
}