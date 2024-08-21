"use client"
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Decks() {
  const numberOfCards = 12; // You can adjust this number as needed

  return (
    <div className="flex flex-col pt-10 items-center justify-center min-h-screen p-4 bg-gradient-to-b from-blue-50 to-[#2174a5]">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Your Decks</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(numberOfCards)].map((_, index) => (
          <Card key={index} className="w-[250px] cursor-pointer" onClick={() => window.location.href = '/flashcards'}>
            <CardHeader>
              <CardTitle className="text-center text-3xl font-bold">
                {index + 1}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center">Flashcard content</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
