import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/db";
import { AuthOptions, Session } from "next-auth";

export const authConfig: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  
  secret: process.env.NEXTAUTH_SECRET,
  
  // Explicitly set session strategy when using adapter
  session: {
    strategy: "database",
  },
  
  callbacks: {
    async session({ session, user }: { session: Session; user: any }) {
      // With database sessions, use user.id instead of token.sub
      if (session.user && user) {
        session.user.id = user.id;
      }
      return session;
    },
    
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }): Promise<string> {
      // Handle OAuth callback properly
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      
      // If it's a callback URL on the same origin, allow it
      if (new URL(url).origin === baseUrl) return url;
      
      // For successful sign-in, redirect to interview page
      if (url === baseUrl) return `${baseUrl}/interview`;
      
      return baseUrl;
    },
  },
  
  // Enable debug in development
  debug: process.env.NODE_ENV === "development",
  
  // Optional: Custom pages
  pages: {
    signIn: "/login",
    error: "/auth/error", // Custom error page
  },
};