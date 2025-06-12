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
        Prepare for ORE Part 2. On the go. 🏎️💨  
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
          Let's Go!
        </button>
      </Link>
    </main>
  );
}