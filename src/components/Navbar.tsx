'use client'

import Link from 'next/link'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow p-4 flex justify-between items-center">
      <Link href="/home">
        <span className="text-xl font-bold text-blue-600 cursor-pointer hover:underline">
          FlashGuides
        </span>
      </Link>
    </header>
  )
}