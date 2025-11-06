// web/src/app/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Loader2 } from "lucide-react"; // Good for loading spinners

export default function HomePage() {
  const { user, isLoading } = useAuth();

  // Show a loading spinner while the AuthContext is checking the user
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Welcome to Real-Time Chat</h1>
      {user ? (
        // User is logged IN
        <div className="text-center">
          <p className="text-xl text-muted-foreground mb-6">
            Welcome back, {user.userName}!
          </p>
          <Button asChild size="lg">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      ) : (
        // User is logged OUT
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      )}
    </div>
  );
}