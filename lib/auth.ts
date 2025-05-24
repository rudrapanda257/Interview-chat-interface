// lib/auth.ts
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/db";
import type { AuthOptions } from "next-auth";
import type { Session } from "next-auth";

export const authConfig: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  
  secret: process.env.NEXTAUTH_SECRET,
  
  session: {
    strategy: "database",
  },
  
  callbacks: {
    async session({ session, user }: { session: Session; user: any }) {
      if (session.user && user) {
        session.user.id = user.id;
      }
      return session;
    },
    
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }): Promise<string> {
      // Handle OAuth callback properly
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      
      // If it's a callback URL on the same origin, allow it
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch (error) {
        // If URL parsing fails, default to baseUrl
        console.log("URL parsing error:", error);
      }
      
      // For successful sign-in, redirect to interview page
      if (url === baseUrl) return `${baseUrl}/interview`;
      
      return baseUrl;
    },
  },
  
  // Enable debug to see detailed logs
  debug: true,
  
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
};