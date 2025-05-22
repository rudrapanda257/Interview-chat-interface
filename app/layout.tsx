// app/layout.tsx
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
// import Navbar from "@/components/Navbar";
import { SessionProvider } from "next-auth/react";
import NextAuthSessionProvider from "@/components/SessionProvider";
import { ReactNode } from 'react';
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Content Strategy Interview App",
  description: "AI-powered content strategist interviewer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
      
        <NextAuthSessionProvider>
        
          <div className="w-screen h-screen  bg-cover bg-center bg-no-repeat">
          {/* Your content here */}
           {children}
          </div>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
