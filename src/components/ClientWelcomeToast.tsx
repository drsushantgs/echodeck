"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

export default function ClientWelcomeToast() {
  useEffect(() => {
    const seen = sessionStorage.getItem("startHereSeen");
    if (!seen) {
      toast(
        (t) => (
          <span>
            🎓 First time here?{" "}
            <a
              href="/start-here"
              className="underline text-teal"
              onClick={() => toast.dismiss(t.id)}
            >
              See how it works
            </a>
          </span>
        ),
        { duration: 8000 }
      );
      sessionStorage.setItem("startHereSeen", "true");
    }
  }, []);

  return null;
}