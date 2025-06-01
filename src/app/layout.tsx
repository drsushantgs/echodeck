// src/app/layout.tsx

import "./globals.css";
import type { Metadata } from "next";

// We’re using the Inter font for body; Space Grotesk is available for headings via font-display
export const metadata: Metadata = {
  title: "EchoDeck",
  description: "Clarity. Confidence. Control. Master UK dental guidelines — one flashcard at a time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-brand-ivory font-sans text-brand-navy min-h-screen">
        {children}

        {/* Floating Feedback Button (already done) */}
        <a
          href="mailto:support@echodeck.com?subject=Feedback for EchoDeck&body=I%20wanted%20to%20share%3A"
          className="fixed bottom-6 right-6 bg-brand-teal hover:bg-brand-coral text-white px-4 py-2 rounded-full shadow-lg z-50 text-sm"
        >
          Help us improve ⚡
        </a>
      </body>
    </html>
  );
}
