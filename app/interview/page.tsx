"use client";
import ChatComponent from "@/components/ChatComponent";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  return (
      <div>
      <Navbar/>
      <div className="pt-5 pb-0 px-4">
        <ChatComponent/>
      </div>
    </div>
  );
}