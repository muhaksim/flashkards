"use client";

import { SignUp } from '@clerk/nextjs'
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function Page() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      checkAndRegisterUser();
    }
  }, [isLoaded, user]);

  const checkAndRegisterUser = async () => {
    try {
      const checkResponse = await fetch(`https://flashcard-api-sable.vercel.app/api/v1/users/${user.id}`);
      
      if (checkResponse.status === 404) {
        const registerResponse = await fetch('https://flashcard-api-sable.vercel.app/api/v1/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: user.id,
            email: user.primaryEmailAddress.emailAddress,
            full_name: `${user.firstName} ${user.lastName}`,
          }),
        });

        if (registerResponse.ok) {
          console.log('User registered successfully');
        } else {
          console.error('Failed to register user');
        }
      } else if (checkResponse.ok) {
        console.log('User already exists');
      } else {
        console.error('Error checking user existence');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp />
    </div>
  )
}
