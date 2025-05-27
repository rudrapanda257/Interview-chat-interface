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
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch (error) {
        console.log("URL parsing error:", error);
      }
      if (url === baseUrl) return `${baseUrl}/interview`;
      
      return baseUrl;
    },
  },
  debug: true,
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
};