"use client";
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

export default function LandingPage() {
  const router = useRouter();
  const {isSignedIn} = useAuth();

  return (
    <div className="flex flex-col pt-40 items-center justify-center min-h-screen p-4 bg-gradient-to-b from-blue-50 to-[#2174a5]">
      <h1 className="text-5xl font-bold mb-6 text-gray-800 text-center">
        <span className="text-[#3067ff]">Study Easily</span> with our AI tool.
      </h1>
      <p className="text-xl text-gray-600 text-center max-w-2xl">
        Effortlessly Study for your exams with our intuitive AI tool.
      </p>
      <button
        onClick={() => isSignedIn ? router.push('/decks') : router.push('/sign-up')}
        className="mt-8 bg-[#033f78] text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:bg-[#139af4] transition duration-200"
      >
        Try for free
      </button>

      {/* Inserted Image */}
      <div className="mt-16 w-full max-w-6xl px-4">
        <img src="/scraper.png" alt="Scraping tool demo" className="rounded-lg shadow-lg w-full" />
      </div>
    </div>
  );
}
