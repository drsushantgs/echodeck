// src/app/page.tsx

import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 bg-white">
      {/* 1) Logo / Wordmark */}
      <div className="mb-8 pt-8">
        <Image
          src="/images/echodeck wordmark.png"
          alt="EchoDeck"
          width={800}
          height={200}
          priority
        />
      </div> 

      {/* 3) Short tagline / value proposition */}
      <p className="text-lg sm:text-xl text-brand-navy text-center max-w-xl leading-relaxed mb-8">
        Ace ORE Part 2. Flashcards that actually stick. 🚀  
      </p>

      <ul className="text-sm sm:text-base text-gray-700 mt-2 space-y-1 mb-8">
        <li>✅ Stop wasting time on 100s of guideline pages</li>
        <li>📱 Study anywhere — even in line at Tesco</li>
        <li>🎯 Designed by dentists. Built to pass.</li>
      </ul>

      {/* 4) Primary CTA */}
      <Link href="/auth">
        <button className="
            bg-brand-teal 
            hover:bg-opacity-90 
            text-white 
            font-semibold 
            px-8 
            py-3 
            rounded-full 
            text-lg 
            transition
          ">
          👉 Start Studying Now
        </button>
      </Link>

      <p className="mt-2 text-sm text-gray-500">
        New here? <Link href="/start-here" className="text-teal hover:underline">See how it works</Link>
      </p>
    </main>
  );
}