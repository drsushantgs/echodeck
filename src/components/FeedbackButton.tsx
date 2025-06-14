"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseBrowser";
import Button from "@/components/ui/Button";

interface Feedback {
  id: string;
  message: string;
  created_at: string;
  resolved: boolean;
}

interface Response {
  id: string;
  feedback_id: string;
  message: string;
  sender_role: "user" | "admin";
  created_at: string;
}

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [thread, setThread] = useState<Response[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (open && userId) {
      (async () => {
        setLoading(true);
        const { data: feedbacks } = await supabase
          .from("feedback")
          .select("*")
          .eq("user_id", userId)
          .eq("resolved", false)
          .order("created_at", { ascending: false });

        if (feedbacks && feedbacks.length > 0) {
          setFeedback(feedbacks[0]);
          const { data: responses } = await supabase
            .from("feedback_responses")
            .select("*")
            .eq("feedback_id", feedbacks[0].id)
            .order("created_at", { ascending: true });
          setThread(responses || []);
        } else {
          setFeedback(null);
          setThread([]);
        }
        setLoading(false);
      })();
    }
  }, [open, userId]);

  async function sendReply() {
    if (!reply.trim()) return;

    // If no existing thread, create feedback first
    let feedbackId = feedback?.id;
    if (!feedbackId && userId) {
      const {
        data,
        error,
      } = await supabase.from("feedback").insert({
        user_id: userId,
        message: reply,
        resolved: false,
        page_url: window.location.href,
      }).select().single();
      if (data?.id) {
        feedbackId = data.id;
        setFeedback(data);
        setThread([]);
      } else {
        return console.error("Failed to start feedback thread", error);
      }
    }

    const { error } = await supabase.from("feedback_responses").insert({
      feedback_id: feedbackId,
      message: reply,
      sender_role: "user",
    });

    if (!error) {
      setThread((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          feedback_id: feedbackId!,
          message: reply,
          sender_role: "user",
          created_at: new Date().toISOString(),
        },
      ]);
      setReply("");
      setSent(true);
    } else {
      console.error("Failed to send reply", error);
    }
  }

  async function markResolved() {
    if (!feedback) return;
    const { error } = await supabase
      .from("feedback")
      .update({ resolved: true })
      .eq("id", feedback.id);
    if (!error) {
      setFeedback(null);
      setThread([]);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-brand-teal hover:bg-brand-coral text-white px-4 py-2 rounded-full shadow-lg z-50 text-sm"
      >
        {sent ? "Got it - I'll be in touch soon 🙌🏻" : "👋🏻 Hey there! Something bugging you?"}
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 bg-white border border-grey-300 shadow-xl rounded-xl w-80 max-h-[80vh] overflow-y-auto p-4 z-50 animate-fadeIn">
          <h2 className="text-sm font-semibold text-brand-navy mb-2">
            {loading ? "Loading..." : "💬 Founder"}
          </h2>

          <div className="space-y-3 mb-3">
            {feedback && (
              <div className="text-xs text-grey-dark">
                Started on {new Date(feedback.created_at).toLocaleString()}
              </div>
            )}
            {thread.map((r) => (
              <div
                key={r.id}
                className={`text-sm p-2 rounded-md max-w-[75%] ${
                  r.sender_role === "admin"
                    ? "bg-brand-teal text-white ml-auto"
                    : "bg-grey-100 text-grey-800"
                }`}
              >
                {r.message}
              </div>
            ))}
          </div>

          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="This message goes straight to me — I’ll do my best to help you out quickly."
            rows={2}
            className="w-full border border-grey-300 rounded-lg px-3 py-2 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal"
          />

          <div className="flex justify-between items-center mt-2">
            {feedback && (
              <button
                onClick={markResolved}
                className="text-xs text-grey hover:underline"
              >
                Mark as Resolved
              </button>
            )}
            <Button size="sm" onClick={sendReply}>
              Send
            </Button>
          </div>
        </div>
      )}
    </>
  );
}