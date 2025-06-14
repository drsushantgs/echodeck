"use client";

import { useEffect, useState, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import Button from "@/components/ui/Button";

const supabase = createClientComponentClient<Database>();

export default function AdminFeedbackPage() {
  const [threads, setThreads] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchFeedback() {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .eq("resolved", false)
        .order("created_at", { ascending: false });

      if (data) setThreads(data);
      else console.error("Error fetching feedback:", error);
    }

    fetchFeedback();
  }, []);

  useEffect(() => {
    async function fetchResponses() {
      if (!selected) return;
      const { data, error } = await supabase
        .from("feedback_responses")
        .select("*")
        .eq("feedback_id", selected.id)
        .order("created_at", { ascending: true });

      if (data) {
        setResponses(data);
        // Scroll to bottom of thread
        setTimeout(() => {
          threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
        }, 100);
      } else {
        console.error("Error fetching responses:", error);
      }
    }

    fetchResponses();
  }, [selected]);

  async function sendReply() {
    if (!reply.trim() || !selected) return;

    const { error } = await supabase.from("feedback_responses").insert({
      feedback_id: selected.id,
      message: reply,
      sender_role: "admin",
    });

    if (!error) {
      setResponses((r) => [
        ...r,
        {
          feedback_id: selected.id,
          message: reply,
          sender_role: "admin",
          created_at: new Date().toISOString(),
        },
      ]);
      setReply("");
    } else {
      console.error("Error sending reply:", error);
    }
  }

  async function markResolved() {
    if (!selected) return;
    if (!confirm("Mark this thread as resolved?")) return;

    const { error } = await supabase
      .from("feedback")
      .update({ resolved: true })
      .eq("id", selected.id);

    if (!error) {
      setThreads((t) => t.filter((f) => f.id !== selected.id));
      setSelected(null);
      setResponses([]);
      setReply("");
    } else {
      console.error("Error marking resolved:", error);
    }
  }

  return (
    <main className="p-6 bg-brand-ivory min-h-screen">
      <h1 className="text-xl font-bold text-brand-navy mb-6">🛠 Feedback Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-xl p-4 bg-white">
          <h2 className="text-sm font-semibold text-grey mb-2">Unresolved</h2>
          {threads.length === 0 ? (
            <p className="text-sm text-grey-light">All caught up! 🎉</p>
          ) : (
            threads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => setSelected(thread)}
                className="border-b py-3 px-2 cursor-pointer hover:bg-brand-ivory rounded-md"
              >
                <p className="text-sm font-medium text-brand-navy">
                  {thread.email || "Anonymous"}
                </p>
                <p className="text-xs text-grey truncate">{thread.message}</p>
                <p className="text-xs text-grey-light">{new Date(thread.created_at).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>

        {selected && (
          <div className="md:col-span-2 border rounded-xl p-4 bg-white">
            <h2 className="text-sm font-semibold text-grey mb-4">
              Conversation with {selected.email || "Anonymous"} on {new Date(selected.created_at).toLocaleDateString()}
            </h2>

            <div
              ref={threadRef}
              className="space-y-3 max-h-[60vh] overflow-y-auto p-1 rounded"
            >
              <div className="bg-brand-coral/10 p-3 rounded-lg">
                <p className="text-sm text-brand-navy">{selected.message}</p>
                <p className="text-xs text-grey-light mt-1">{new Date(selected.created_at).toLocaleString()}</p>
              </div>
              {responses.map((r, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg ${
                    r.sender_role === "admin" ? "bg-brand-teal/10" : "bg-brand-coral/10"
                  }`}
                >
                  <p className="text-sm text-brand-navy">{r.message}</p>
                  <p className="text-xs text-grey-light mt-1">{new Date(r.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              <textarea
                className="w-full border border-grey-300 rounded p-2 text-sm"
                rows={3}
                placeholder="Write a reply to the user..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={sendReply} intent="primary" size="sm">
                  Send Reply
                </Button>
                <Button onClick={markResolved} intent="secondary" size="sm">
                  Mark as Resolved
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}