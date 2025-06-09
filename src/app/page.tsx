// src/app/page.tsx

import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 bg-white">
      {/* 1) Logo / Wordmark */}
      <div className="mb-8">
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
        The fastest, most focused way to master your UK dental guidelines for the ORE Part 2. 
      </p>

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
          Log In / Sign Up
        </button>
      </Link>

       {/* ===== 5) Three “Feature Tiles” Below CTA ===== */}
      <div className="grid grid-cols-3 gap-4 mt-12 w-full max-w-4xl">
        {/* Tile 1: Self-Paced */}
        <div className="flex flex-col items-center text-center p-6 bg-gray-light rounded-lg shadow-sm">
          {/* Example icon—swap with your SVG or emoji */}
          <div className="mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-brand-teal"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {/* Clock icon */}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-brand-navy text-lg mb-2">Self-Paced</h3>
          <p className="text-brand-navy/80 text-sm">
            Study on your own schedule—no rigid classes, no distractions.
          </p>
        </div>

        {/* Tile 2: Track Your Progress */}
        <div className="flex flex-col items-center text-center p-6 bg-gray-light rounded-lg shadow-sm">
          {/* Example icon—swap with your SVG or emoji */}
          <div className="mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-brand-teal"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {/* Chart icon */}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-6a2 2 0 00-2-2H5m4 8v-6a2 2 0 012-2h2m0 8v-4a2 2 0 012-2h2m0 6v-2a2 2 0 012-2h2"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-brand-navy text-lg mb-2">
            Track Your Progress
          </h3>
          <p className="text-brand-navy/80 text-sm">
            Instantly see how many flashcards you’ve mastered versus remaining.
          </p>
        </div>

        {/* Tile 3: ORE Part 2 Focus */}
        <div className="flex flex-col items-center text-center p-6 bg-gray-light rounded-lg shadow-sm">
          {/* Example icon—swap with your SVG or emoji */}
          <div className="mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-brand-teal"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {/* Book icon */}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6l4 2M19 19V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14l5-2 5 2 5-2z"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-brand-navy text-lg mb-2">
            ORE Part 2 Focus
          </h3>
          <p className="text-brand-navy/80 text-sm">
            All flashcards are curated around the exact UK dental guidelines you need.
          </p>
        </div>
      </div>
    </main>
  );
}