"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseBrowser";
import Button from "@/components/ui/Button";

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
      setUserEmail(user?.email ?? null);
    };
    fetchUser();
  }, []);

  const sendFeedback = async () => {
    if (!message.trim()) return;

    const { error } = await supabase.from("feedback").insert({
      message,
      user_id: userId,
      email: userEmail,
      page_url: window.location.href,
      resolved: false,
    });

    if (error) {
      console.error("❌ Feedback submission failed:", error);
      alert("Something went wrong. Please try again.");
    } else {
      setSent(true);
      setMessage("");
      setTimeout(() => {
        setSent(false);
        setOpen(false);
      }, 3000);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-brand-teal hover:bg-brand-coral text-white px-4 py-2 rounded-full shadow-lg z-50 text-sm"
      >
        {sent ? "✅ Sent!" : "👋🏻 Hey there! Something bugging you?"}
      </button>

      {open && !sent && (
        <div className="fixed bottom-20 right-6 bg-white border border-grey-300 shadow-xl rounded-xl w-80 p-4 z-50 animate-fadeIn">
          <p className="text-sm font-semibold text-brand-navy mb-2">
            💬 Message the founder
          </p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="This goes straight to me. What's on your mind?"
            rows={3}
            className="w-full border border-grey-300 rounded-lg px-3 py-2 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal"
          />
          <div className="mt-3 flex justify-between items-center">
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-grey hover:underline"
            >
              Cancel
            </button>
            <Button size="sm" onClick={sendFeedback}>
              Send
            </Button>
          </div>
        </div>
      )}
    </>
  );
}