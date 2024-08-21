import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Falshcards() {
  const numberOfCards = 12;
  const flashcards = Array(numberOfCards).fill().map((_, index) => ({
    front: `Front of Card ${index + 1}`,
    back: `Back of Card ${index + 1}`
  }));

  return (
    <div className="flex flex-col pt-10 items-center justify-center min-h-screen p-4 bg-gradient-to-b from-blue-50 to-[#2174a5]">
      <h1 className="text-4xl font-bold mb-8 text-gray-800 m-16">Your Flashcards</h1>
      <div className="w-full max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {flashcards.map((card, index) => (
            <Card key={index} className="w-[250px] h-[200px] perspective-1000">
              <div className="relative w-full h-full transition-transform duration-500 transform-style-preserve-3d hover:rotate-y-180">
                <div className="absolute w-full h-full backface-hidden">
                  <CardHeader>
                    <CardTitle className="text-center text-3xl font-bold">
                      {index + 1}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center">{card.front}</p>
                  </CardContent>
                </div>
                <div className="absolute w-full h-full backface-hidden rotate-y-180">
                  <CardContent className="flex items-center justify-center h-full">
                    <p className="text-center">{card.back}</p>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
