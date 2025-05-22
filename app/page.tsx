"use client";

import ChatComponent from "@/components/ChatComponent";
import Navbar from "@/components/Navbar";

export default function Home() {



    // Show login page UI or button here
    return (
      <main className="h-screen flex flex-col justify-center items-center bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926')] bg-cover bg-center">
        <Navbar/>
        <ChatComponent/>
      </main>
    );
  }




