"use client";
import ChatComponent from "@/components/ChatComponent";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-600">
      <Navbar/>
      <div className="pt-20 pb-6 px-4">
        <ChatComponent/>
      </div>
    </div>
  );
}