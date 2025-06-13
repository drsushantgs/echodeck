"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Button from "@/components/ui/Button";

interface Props {
  subjectUuid: string;
}

export default function AddFlashcard({ subjectUuid }: Props) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [embedHtml, setEmbedHtml] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.from("flashcards").insert({
      subject_uuid: subjectUuid,
      question,
      answer,
      image_url: imageUrl || null,
      video_url: videoUrl || null,
      embed_html: embedHtml || null,
      link_url: linkUrl || null,
    });

    if (error) {
      setMessage("Error adding flashcard: " + error.message);
    } else {
      setMessage("Flashcard added!");
      setQuestion("");
      setAnswer("");
      setImageUrl("");
      setVideoUrl("");
      setEmbedHtml("");
      setLinkUrl("");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 bg-white rounded shadow space-y-4">
      <h2 className="text-xl font-semibold mb-4">Add Flashcard</h2>

      <label>
        Question
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          className="w-full p-2 border rounded"
          rows={2}
        />
      </label>

      <label>
        Answer (HTML allowed)
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          required
          className="w-full p-2 border rounded"
          rows={3}
        />
      </label>

      <label>
        Image URL
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full p-2 border rounded"
        />
      </label>

      <label>
        Video URL (mp4, etc)
        <input
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://example.com/video.mp4"
          className="w-full p-2 border rounded"
        />
      </label>

      <label>
        Embed HTML (YouTube iframe, etc)
        <textarea
          value={embedHtml}
          onChange={(e) => setEmbedHtml(e.target.value)}
          placeholder={`<iframe ...></iframe>`}
          className="w-full p-2 border rounded"
          rows={3}
        />
      </label>

      <label>
        Link URL (external)
        <input
          type="url"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full p-2 border rounded"
        />
      </label>

      <Button type="submit" intent="primary" size="md" disabled={loading}>
        {loading ? "Adding..." : "Add Flashcard"}
      </Button>

      {message && <p className="mt-4 text-center">{message}</p>}
    </form>
  );
}