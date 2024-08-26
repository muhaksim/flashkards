"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Flashcards() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deckName, setDeckName] = useState("Your Flashcards");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flashcards, setFlashcards] = useState([]);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const storedDeckTitle = localStorage.getItem("currentDeckTitle");
    if (storedDeckTitle) {
      setDeckName(storedDeckTitle);
    }

    const deckId = searchParams.get("deckId");
    if (deckId) {
      fetchFlashcards(deckId);
    }

    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") {
        handleNextCard();
      } else if (event.key === "ArrowLeft") {
        handlePreviousCard();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [searchParams, flashcards.length]);

  const fetchFlashcards = async (deckId) => {
    try {
      const response = await fetch(`https://flashcard-api-sable.vercel.app/api/v1/flashcards/${deckId}`);
      if (response.ok) {
        const data = await response.json();
        setFlashcards(data);
      } else {
        console.error("Failed to fetch flashcards");
      }
    } catch (error) {
      console.error("Error fetching flashcards:", error);
    }
  };

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

  const handleFlipCard = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <>
      {/* Conditionally render header based on the current page */}
      {false && ( // Change this condition based on your routing logic
        <header className="header">
          <h1>Flashcard App</h1>
        </header>
      )}
      <div className="flex flex-col pt-10 items-center justify-center min-h-screen p-4 px-8 bg-gradient-to-b from-blue-50 to-[#2174a5]">
        <Button onClick={() => router.push('/decks')}>Go back Decks</Button>
        <h1 className="text-4xl font-bold mb-8 text-gray-800 m-16">{deckName}</h1>
        {/* Navigation to deck */}
        
        {flashcards.length > 0 ? (
          <div className="w-full max-w-2xl">
            <div className="flip-card mb-6">
              <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`} onClick={handleFlipCard}>
                <div className="flip-card-front">
                  <Card className="h-64 flex items-center justify-center">
                    <p className="text-xl font-semibold">{flashcards[currentCardIndex].question}</p>
                  </Card>
                </div>
                <div className="flip-card-back">
                  <Card className="h-64 flex items-center justify-center">
                    <p className="text-xl font-semibold">{flashcards[currentCardIndex].answer}</p>
                  </Card>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <Button onClick={handlePreviousCard}>Previous</Button>
              <Button onClick={handleNextCard}>Next</Button>
            </div>
          </div>
        ) : (
          <p>No flashcards available for this deck.</p>
        )}
      </div>
    </>
  );
}