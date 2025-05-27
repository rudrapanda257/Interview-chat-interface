"use client";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-[url('https://images.unsplash.com/photo-1517336714731-489689fd1ca8')] bg-cover bg-center">
      <div className="p-8 bg-white rounded-xl shadow-md space-y-4 text-center">
        <h1 className="text-2xl font-bold">Chat Page</h1>
        <p>Login with your Google account to continue.</p>
        <Button onClick={() => signIn("google")}>Login with Google</Button>
      </div>
    </div>
  );
}
