"use client";

import ChatComponent from "@/components/ChatComponent";
import Navbar from "@/components/Navbar";

export default function Home() {



    // Show login page UI or button here
    return (
      <main className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center items-center ">
        <Navbar/>
        <div className="mt-5"></div>
        <ChatComponent/>
      </main>
    );
  }




