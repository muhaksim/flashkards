"use client";
import React, { useState, useCallback } from "react";
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
  const [newDeckDescription, setNewDeckDescription] = useState("");
  const [newDeckTitle, setNewDeckTitle] = useState("");
  const [editingDeck, setEditingDeck] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleCreateDeck = async (e) => {
    e.preventDefault();
    const trimmedTitle = newDeckTitle.trim();
    const trimmedDescription = newDeckDescription.trim();
  
    if (trimmedTitle.length >= 1 && trimmedDescription.length >= 1) {
      try {
        console.log("Attempting to create deck...");
        const response = await fetch(
          "https://flashcard-api-sable.vercel.app/api/v1/decks",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: trimmedTitle,
              description: trimmedDescription,
              owner_id: user.id,
            }),
          }
        );
        console.log("Fetch completed, response status:", response.status);
  
        if (response.ok) {
          const createdDeck = await response.json();
          console.log("Deck created successfully", createdDeck);
          setNewDeckTitle("");
          setNewDeckDescription("");
          setIsPopoverOpen(false); // Close the popover after successful creation
          await generateFlashcards(createdDeck.id, trimmedDescription);
          fetchDecks();
        } else {
          console.error("Failed to create deck, status:", response.status);
        }
      } catch (error) {
        console.error("Error in fetch operation:", error);
      }
    } else {
      console.log("Title and description must be at least 1 character long");
    }
  };
  
  const generateFlashcards = async (deckId, topic) => {
    try {
      const generateResponse = await fetch(
        "https://flashcard-api-sable.vercel.app/api/v1/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            deck_id: deckId,
            topic: topic,
          }),
        }
      );
  
      if (generateResponse.ok) {
        const generatedData = await generateResponse.json();
        console.log("Flashcards generated successfully", generatedData);
  
        // Save generated flashcards
        for (const flashcard of generatedData.flashcards) {
          await fetch("https://flashcard-api-sable.vercel.app/api/v1/flashcards", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              question: flashcard.front,
              answer: flashcard.back,
              deck_id: deckId,
            }),
          });
        }
        console.log("All flashcards saved successfully");
      } else {
        console.error("Failed to generate flashcards, status:", generateResponse.status);
      }
    } catch (error) {
      console.error("Error generating flashcards:", error);
    }
  };

  const fetchDecks = useCallback(async () => {
    if (user && user.id) {
      try {
        const response = await fetch(
          `https://flashcard-api-sable.vercel.app/api/v1/decks/${user.id}`
        );
        if (response.ok) {
          const userDecks = await response.json();
          console.log("Fetched user decks:", userDecks);
          setDecks(userDecks);
        } else {
          console.error("Failed to fetch decks");
        }
      } catch (error) {
        console.error("Error fetching decks:", error);
      }
    } else {
      console.log("User not found");
    }
  }, [user]);

  const handleUpdateDeck = async (id, newTitle, newDescription) => {
    try {
      const response = await fetch(
        `https://flashcard-api-sable.vercel.app/api/v1/decks/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newTitle,
            description: newDescription,
            owner_id: user.id,
          }),
        }
      );

      if (response.ok) {
        const updatedDeck = await response.json();
        console.log(`Deck ${id} updated successfully`, updatedDeck);
        setDecks(decks.map((deck) =>
          deck.id === id ? { ...deck, name: newTitle, description: newDescription } : deck
        ));
        setEditingDeck(null);
      } else {
        console.error(`Failed to update deck ${id}, status:`, response.status);
        // Add user feedback for failure (e.g., set an error state)
      }
    } catch (error) {
      console.error(`Error updating deck ${id}:`, error);
      // Add user feedback for network errors
    }
  };

  const handleDeleteDeck = async (id) => {
    try {
      const response = await fetch(
        `https://flashcard-api-sable.vercel.app/api/v1/decks/${id}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        console.log(`Deck ${id} deleted successfully`);
        // Remove the deleted deck from the local state
        setDecks(decks.filter((deck) => deck.id !== id));
      } else {
        console.error(`Failed to delete deck ${id}, status:`, response.status);
        // Add user feedback for failure (e.g., set an error state)
      }
    } catch (error) {
      console.error(`Error deleting deck ${id}:`, error);
      // Add user feedback for network errors
    }
  };

  const handleCardClick = (id, title) => {
    localStorage.setItem("currentDeckTitle", title);
    router.push(`/flashcards?deckId=${id}`);
  };

  useEffect(() => {
    if (user) {
      fetchDecks();
    }
  }, [user, fetchDecks]);


  return (
    <div className="flex flex-col pt-10 items-center justify-center min-h-screen p-4 bg-gradient-to-b from-blue-50 to-[#2174a5]">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Your Decks</h1>
  
      {/* Create New Deck Popover */}
      <div className="pb-4">
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button className="mb-4">Create a new deck</Button>
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
                  value={newDeckTitle}
                  onChange={(e) => setNewDeckTitle(e.target.value)}
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
      </div>

  
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {decks.map((deck) => (
          <Card
            key={deck.id}
            className="w-[250px] cursor-pointer hover:shadow-lg transition-shadow duration-300"
            onClick={() => editingDeck !== deck.id && handleCardClick(deck.id, deck.name)}
          >
            <CardHeader>
              {editingDeck === deck.id ? (
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleUpdateDeck(deck.id, editedTitle, editedDescription);
                    }
                  }}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <CardTitle className="text-center text-3xl font-bold">
                  {deck.name}
                </CardTitle>
              )}
            </CardHeader>
            <CardContent>
              {editingDeck === deck.id ? (
                <Input
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleUpdateDeck(deck.id, editedTitle, editedDescription);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <p className="text-center">{deck.description}</p>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              {editingDeck === deck.id ? (
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateDeck(deck.id, editedTitle, editedDescription);
                  }}
                >
                  Save
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingDeck(deck.id);
                    setEditedTitle(deck.name);
                    setEditedDescription(deck.description);
                  }}
                >
                  Edit
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
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