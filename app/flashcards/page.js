"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export default function Flashcards() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deckName, setDeckName] = useState("Your Flashcards");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flashcards, setFlashcards] = useState([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [deckId, setDeckId] = useState(searchParams.get("deckId"));
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState("");
  const [editedAnswer, setEditedAnswer] = useState("");

  const handleNextCard = useCallback(() => {
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
    setIsFlipped(false);
  }, [flashcards.length]);

  const handlePreviousCard = useCallback(() => {
    setCurrentCardIndex(
      (prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length
    );
    setIsFlipped(false);
  }, [flashcards.length]);

  const handleKeyPress = useCallback(
    (event) => {
      if (event.key === "ArrowRight") {
        handleNextCard();
      } else if (event.key === "ArrowLeft") {
        handlePreviousCard();
      }
    },
    [handleNextCard, handlePreviousCard]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    const storedDeckTitle = localStorage.getItem("currentDeckTitle");
    if (storedDeckTitle) {
      setDeckName(storedDeckTitle);
    }

    const deckId = searchParams.get("deckId");
    if (deckId) {
      fetchFlashcards(deckId);
    }
  }, [searchParams]);

  const fetchFlashcards = async (deckId) => {
    try {
      const response = await fetch(
        `https://flashcard-api-sable.vercel.app/api/v1/flashcards/${deckId}`
      );
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

  const handleFlipCard = (e) => {
    if (!editMode) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleCreateFlashcard = async (e) => {
    e.preventDefault();
    if (newQuestion.trim() && newAnswer.trim() && deckId) {
      try {
        const response = await fetch(
          "https://flashcard-api-sable.vercel.app/api/v1/flashcards/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              question: newQuestion,
              answer: newAnswer,
              deck_id: deckId,
            }),
          }
        );

        if (response.ok) {
          const createdFlashcard = await response.json();
          setFlashcards((prev) => [...prev, createdFlashcard]);
          setNewQuestion("");
          setNewAnswer("");
          setShowForm(false);
          console.log("Flashcard created successfully", createdFlashcard);
        } else {
          console.error("Failed to create flashcard, status:", response.status);
        }
      } catch (error) {
        console.error("Error creating flashcard:", error);
      }
    } else {
      console.log("Question and answer must not be empty");
    }
  };

  const handleEditFlashcard = useCallback(
    (e) => {
      e.stopPropagation();
      const currentFlashcard = flashcards[currentCardIndex];
      setEditedQuestion(currentFlashcard.question);
      setEditedAnswer(currentFlashcard.answer);
      setEditMode(true);
    },
    [flashcards, currentCardIndex]
  );

  const handleUpdateFlashcard = async () => {
    const currentFlashcard = flashcards[currentCardIndex];
    try {
      const response = await fetch(
        `https://flashcard-api-sable.vercel.app/api/v1/flashcards/${currentFlashcard.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: editedQuestion,
            answer: editedAnswer,
            deck_id: deckId, // Include deck_id in the update
          }),
        }
      );

      if (response.ok) {
        const updatedFlashcard = await response.json();
        const updatedFlashcards = [...flashcards];
        updatedFlashcards[currentCardIndex] = updatedFlashcard;
        setFlashcards(updatedFlashcards);
        setEditMode(false); // Exit edit mode after saving
      } else {
        console.error("Failed to update flashcard");
      }
    } catch (error) {
      console.error("Error updating flashcard:", error);
    }
  };

  const handleDeleteFlashcard = async () => {
    const currentFlashcard = flashcards[currentCardIndex];
    try {
      const response = await fetch(
        `https://flashcard-api-sable.vercel.app/api/v1/flashcards/${currentFlashcard.id}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        const updatedFlashcards = flashcards.filter(
          (_, index) => index !== currentCardIndex
        );
        setFlashcards(updatedFlashcards);
        if (currentCardIndex >= updatedFlashcards.length) {
          setCurrentCardIndex(updatedFlashcards.length - 1);
        }
      } else {
        console.error("Failed to delete flashcard");
      }
    } catch (error) {
      console.error("Error deleting flashcard:", error);
    }
  };

  return (
    <>
      <div className="flex flex-col pt-10 items-center justify-center min-h-screen p-4 px-8 bg-gradient-to-b from-blue-50 to-[#2174a5]">
        <h1 className="text-4xl font-bold mb-8 text-gray-800 m-8">
          {deckName}
        </h1>
        <div className="pb-8">
          <Popover open={showForm} onOpenChange={setShowForm}>
            <PopoverTrigger asChild>
              <Button className="mb-4">Add Flashcard</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <form onSubmit={handleCreateFlashcard}>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">New Flashcard</h4>
                  </div>
                  <div className="grid gap-2">
                    <Input
                      type="text"
                      placeholder="Question"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      required
                    />
                    <Input
                      type="text"
                      placeholder="Answer"
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit">Create Flashcard</Button>
                </div>
              </form>
            </PopoverContent>
          </Popover>
        </div>
        {flashcards.length > 0 ? (
          <div className="w-full max-w-2xl">
            <div className="text-center mb-4">
              <span className="text-lg font-semibold">
                {currentCardIndex + 1}/{flashcards.length}
              </span>
            </div>
            <div className="flip-card mb-6">
              <div
                className={`flip-card-inner ${isFlipped ? "flipped" : ""}`}
                onClick={handleFlipCard}
              >
                <div className="flip-card-front">
                  <Card className="h-64 flex flex-col items-center justify-center p-4">
                    <p className="text-lg font-semibold mb-2">Question:</p>
                    <p className="text-xl">
                      {flashcards[currentCardIndex].question}
                    </p>
                  </Card>
                </div>
                <div className="flip-card-back">
                  <Card className="h-64 flex flex-col items-center justify-center p-4">
                    <p className="text-lg font-semibold mb-2">Answer:</p>
                    <p className="text-xl">
                      {flashcards[currentCardIndex].answer}
                    </p>
                  </Card>
                </div>
              </div>
            </div>
            <div className="flex justify-between mb-4">
              <Button onClick={handlePreviousCard}>Previous</Button>
              <Button onClick={handleNextCard}>Next</Button>
            </div>
            <div className="flex justify-center space-x-2">
              <Button onClick={handleEditFlashcard}>Edit</Button>
              <Button onClick={handleDeleteFlashcard}>Delete</Button>
            </div>
            {editMode && (
              <div className="mt-4">
                <h4 className="font-medium leading-none">Edit Flashcard</h4>
                <Input
                  type="text"
                  value={editedQuestion}
                  onChange={(e) => setEditedQuestion(e.target.value)}
                  className="mt-2"
                />
                <Input
                  type="text"
                  value={editedAnswer}
                  onChange={(e) => setEditedAnswer(e.target.value)}
                  className="mt-2"
                />
                <div className="flex space-x-2 mt-4">
                  <Button onClick={handleUpdateFlashcard}>Save</Button>
                  <Button onClick={() => setEditMode(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p>No flashcards available for this deck.</p>
        )}
      </div>
    </>
  );
}