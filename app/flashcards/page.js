"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Flashcards() {
  const router = useRouter();
  const [deckName, setDeckName] = useState("Your Flashcards");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const flashcards = [...Array(20)].map((_, i) => ({
    question: `Question ${i + 1}`,
    answer: `Answer ${i + 1}`,
  }));

  const [isFlipped, setIsFlipped] = useState(
    Array(flashcards.length).fill(false)
  );

  useEffect(() => {
    const storedDeckTitle = localStorage.getItem("currentDeckTitle");
    if (storedDeckTitle) {
      setDeckName(storedDeckTitle);
    }
  }, []);

  const handleNextCard = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
    setIsFlipped(false);
  };

  const handlePreviousCard = () => {
    setCurrentCardIndex(
      (prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length
    );
    setIsFlipped(false);
  };

  const handleFlipCard = (index) => {
    setIsFlipped((prev) => {
      const newFlipped = [...prev];
      newFlipped[index] = !newFlipped[index];
      return newFlipped;
    });
  };

  return (
    <div className="flex flex-col pt-10 items-center justify-center min-h-screen p-4 px-8 bg-gradient-to-b from-blue-50 to-[#2174a5]">
      <h1 className="text-4xl font-bold mb-8 text-gray-800 m-16">{deckName}</h1>
      <div className="w-full max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
          {flashcards.map((card, index) => (
            <div key={index} className="flip-card">
              <div className="flip-card-inner">
                <div className="flip-card-front">
                  <Card className="h-64 flex items-center justify-center">
                    <p className="text-xl font-semibold">{card.question}</p>
                  </Card>
                </div>
                <div className="flip-card-back">
                  <Card className="h-64 flex items-center justify-center">
                    <p className="text-xl font-semibold">{card.answer}</p>
                  </Card>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
