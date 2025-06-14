"use client";

import { useState, useEffect } from "react";

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  // ⏱ Reset the "Thanks!" message after 5 seconds
  useEffect(() => {
    if (sent) {
      const timeout = setTimeout(() => {
        setSent(false);
        setOpen(false);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [sent]);

  async function sendFeedback() {
    if (!message.trim()) return;

    const payload = {
      access_key: process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY,
      subject: "EchoDeck Feedback",
      from_name: "Anonymous EchoDeck User",
      message,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setSent(true);
      setMessage("");
    }
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-brand-teal hover:bg-brand-coral text-white px-4 py-2 rounded-full shadow-lg z-50 text-sm"
      >
        {sent ? "Thanks!" : "Help us improve ⚡"}
      </button>

      {/* Feedback Popup */}
      {open && !sent && (
        <div className="fixed bottom-20 right-6 bg-white border border-grey-300 shadow-xl rounded-xl w-80 p-4 z-50 animate-fadeIn">
          <p className="text-sm font-semibold text-brand-navy mb-2">What could be better?</p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. I would love if you could add DBOH, or I am not able to see the next flashcard.."
            className="w-full border border-grey-300 rounded-lg px-3 py-2 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal"
            rows={3}
          />
          <div className="mt-3 flex justify-between">
            <button
              onClick={() => setOpen(false)}
              className="text-grey-700 text-xs hover:underline"
            >
              Cancel
            </button>
            <button
              onClick={sendFeedback}
              className="bg-brand-teal hover:bg-brand-navy text-white text-xs font-semibold px-3 py-1 rounded-md"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}