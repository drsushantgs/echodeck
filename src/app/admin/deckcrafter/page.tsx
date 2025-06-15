// src/app/admin/deckcrafter/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import Button from "@/components/ui/Button";

const supabase = createClientComponentClient<Database>();

export default function DeckCrafterPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selected, setSelected] = useState<{ id: string; name: string } | null>(null);
  const [form, setForm] = useState({
    question: "",
    answer: "",
    image_url: "",
    video_url: "",
    embed_html: "",
    link_url: "",
  });
  const [status, setStatus] = useState<string | null>(null);
  const questionRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchSubjects() {
      const { data, error } = await supabase.from("subjects").select("uuid_id, subject_name").order("subject_name");
      if (data) setSubjects(data);
      else console.error("Error fetching subjects:", error);
    }
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selected && questionRef.current) {
      questionRef.current.focus();
    }
  }, [selected]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        handleSubmit(new Event("submit") as any);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    const { error } = await supabase.from("flashcards").insert({
      subject_uuid: selected.id,
      ...form,
    });

    if (error) {
      console.error("Error adding flashcard:", error);
      setStatus("❌ Error adding flashcard");
    } else {
      setStatus("✅ Flashcard added");
      setForm({ question: "", answer: "", image_url: "", video_url: "", embed_html: "", link_url: "" });
      if (questionRef.current) questionRef.current.focus();
    }
  }

  return (
    <main className="p-6 bg-brand-ivory min-h-screen">
      <h1 className="text-xl font-bold text-brand-navy mb-6">DeckCrafter</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border p-4 rounded-xl">
          <h2 className="text-sm font-semibold text-grey mb-3">Subjects</h2>
          {subjects.map((s) => (
            <div key={s.uuid_id} className="border-b py-2 flex justify-between items-center">
              <p className="text-sm text-brand-navy">{s.subject_name}</p>
              <Button size="sm" onClick={() => setSelected({ id: s.uuid_id, name: s.subject_name })}>
                Craft Deck
              </Button>
            </div>
          ))}
        </div>

        {selected && (
          <div className="bg-white border p-4 rounded-xl w-full">
            <h2 className="text-sm font-semibold text-grey mb-3">
              New Flashcard for <span className="text-brand-navy font-bold">{selected.name}</span>
            </h2>
            <form className="space-y-3" onSubmit={handleSubmit}>
              {Object.entries(form).map(([key, value], idx) => (
                <input
                  key={key}
                  type="text"
                  placeholder={key.replace(/_/g, " ")}
                  value={value}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  ref={idx === 0 ? questionRef : null}
                  className="w-full border p-2 rounded text-sm"
                />
              ))}
              <Button intent="primary" type="submit">Save Card</Button>
              {status && <p className="text-xs text-grey-dark italic pt-1">{status}</p>}
            </form>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-brand-navy mb-2">Card Preview</h3>
              <div className="bg-grey-100 p-4 rounded-md">
                <div className="text-sm font-bold text-brand-navy">Q: {form.question}</div>
                <div className="text-sm text-grey-800 mt-2" dangerouslySetInnerHTML={{ __html: form.answer }} />
                {form.image_url && <img src={form.image_url} alt="preview" className="mt-2 rounded" />}
                {form.video_url && (
                  <video controls className="mt-2 rounded">
                    <source src={form.video_url} type="video/mp4" />
                  </video>
                )}
                {form.embed_html && <div className="mt-2" dangerouslySetInnerHTML={{ __html: form.embed_html }} />}
                {form.link_url && <a href={form.link_url} className="text-blue-600 mt-2 block">Learn more</a>}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}