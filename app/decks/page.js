"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function Decks() {
  const { user } = useUser();
  const router = useRouter();
  const [decks, setDecks] = useState([]);
  const [newDeckName, setNewDeckName] = useState("");
  const [newDeckDescription, setNewDeckDescription] = useState("");
  const [newDeckTitle, setNewDeckTitle] = useState("");
  const [editingDeck, setEditingDeck] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleCreateDeck = async (e) => {
    console.log("I am in the submitting funtion")
    // e.preventDefault();
    if (newDeckTitle.trim()) {
      console.log("I am in the submitting funtion 2")
      const response = await fetch("https://flashcard-api-sable.vercel.app/api/v1/decks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newDeckTitle,
          description: newDeckDescription,
          owner_id: user.id,
        }),
      });

      console.log("This is after response");

      if (response.ok) {
        console.log("The response was ok");
        setNewDeckTitle("");
        setIsPopoverOpen(false);
        fetchDecks(); // Fetch updated decks after creating a new one
        console.log("New deck created successfully!");
      }
    }
  };

  const fetchDecks = async () => {
    try {
      const response = await fetch(
        "https://flashcard-api-sable.vercel.app/api/v1/decks"
      );
      if (response.ok) {
        const fetchedDecks = await response.json();
        setDecks(fetchedDecks);
      } else {
        console.error("Failed to fetch decks");
      }
    } catch (error) {
      console.error("Error fetching decks:", error);
    }
  };

  const handleUpdateDeck = (id, newTitle) => {
    setDecks(
      decks.map((deck) =>
        deck.id === id ? { ...deck, title: newTitle } : deck
      )
    );
    setEditingDeck(null);
  };

  const handleDeleteDeck = (id) => {
    setDecks(decks.filter((deck) => deck.id !== id));
  };

  const handleCardClick = (id, title) => {
    localStorage.setItem("currentDeckTitle", title);
    router.push(`/flashcards?deckId=${id}`);
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  return (
    <div className="flex flex-col pt-10 items-center justify-center min-h-screen p-4 bg-gradient-to-b from-blue-50 to-[#2174a5]">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Your Decks</h1>

      {/* Create New Deck Popover */}
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button className="mb-4">Create New Deck</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <form onSubmit={handleCreateDeck}>
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">New Deck</h4>
              </div>
              <div className="grid gap-2">
                <Input
                  id="deckName"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  placeholder="Deck title"
                />
                <Input
                  id="deckDescription"
                  value={newDeckDescription}
                  onChange={(e) => setNewDeckDescription(e.target.value)}
                  placeholder="What do you want to generate?"
                />
              </div>
              <Button type="submit">Create Deck</Button>
            </div>
          </form>
        </PopoverContent>
      </Popover>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {decks.map((deck) => (
          <Card
            key={deck.id}
            className="w-[250px] cursor-pointer hover:shadow-lg transition-shadow duration-300"
            onClick={() => handleCardClick(deck.id, deck.title)}
          >
            <CardHeader>
              {editingDeck === deck.id ? (
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onBlur={() => handleUpdateDeck(deck.id, editedTitle)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleUpdateDeck(deck.id, editedTitle);
                    }
                  }}
                  autoFocus
                  onClick={(e) => e.stopPropagation()} // Prevent card click when editing
                />
              ) : (
                <CardTitle className="text-center text-3xl font-bold">
                  {deck.title}
                </CardTitle>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-center">Flashcard content</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click
                  setEditingDeck(deck.id);
                  setEditedTitle(deck.title);
                }}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click
                  handleDeleteDeck(deck.id);
                }}
              >
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
