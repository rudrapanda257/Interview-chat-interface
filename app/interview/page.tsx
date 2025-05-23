"use client";
import ChatComponent from "@/components/ChatComponent";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  return (
    // <div className="min-h-screen bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-600">
      <div>
      <Navbar/>
      <div className="pt-5 pb-0 px-4">
        <ChatComponent/>
      </div>
    </div>
  );
}