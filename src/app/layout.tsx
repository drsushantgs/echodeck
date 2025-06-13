// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import FeedbackButton from "@/components/FeedbackButton";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "EchoDeck",
  description: "Clarity. Confidence. Control. Master UK dental guidelines — one flashcard at a time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-brand-ivory font-sans text-brand-navy min-h-screen">
        {children}
        <FeedbackButton />
        <Toaster />
      </body>
    </html>
  );
}