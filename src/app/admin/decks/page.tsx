// src/app/admin/decks/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import Button from "@/components/ui/Button";

const supabase = createClientComponentClient<Database>();

export default function AdminDecksPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState({
    question: "",
    answer: "",
    image_url: "",
    video_url: "",
    embed_html: "",
    link_url: "",
  });

  useEffect(() => {
    async function fetchSubjects() {
      const { data, error } = await supabase.from("subjects").select("uuid_id, subject_name").order("subject_name");
      if (data) setSubjects(data);
      else console.error("Error fetching subjects:", error);
    }
    fetchSubjects();
  }, []);

  async function handleSubmit() {
    if (!selected) return;
    const { error } = await supabase.from("flashcards").insert({
      subject_uuid: selected,
      ...form,
    });

    if (error) console.error("Error adding flashcard:", error);
    else {
      alert("Flashcard added ✅");
      setForm({ question: "", answer: "", image_url: "", video_url: "", embed_html: "", link_url: "" });
      setSelected(null);
    }
  }

  return (
    <main className="p-6 bg-brand-ivory min-h-screen">
      <h1 className="text-xl font-bold text-brand-navy mb-6">Admin Deck Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border p-4 rounded-xl">
          <h2 className="text-sm font-semibold text-grey mb-3">Subjects</h2>
          {subjects.map((s) => (
            <div key={s.uuid_id} className="border-b py-2 flex justify-between items-center">
              <p className="text-sm text-brand-navy">{s.subject_name}</p>
              <Button size="sm" onClick={() => setSelected(s.uuid_id)}>Add Flashcard</Button>
            </div>
          ))}
        </div>

        {selected && (
          <div className="bg-white border p-4 rounded-xl">
            <h2 className="text-sm font-semibold text-grey mb-3">New Flashcard</h2>
            <div className="space-y-3">
              {Object.entries(form).map(([key, value]) => (
                <input
                  key={key}
                  type="text"
                  placeholder={key.replace("_", " ")}
                  value={value}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full border p-2 rounded text-sm"
                />
              ))}
              <Button intent="primary" onClick={handleSubmit}>Submit Flashcard</Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}