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

  secret: process.env.NEXTAUTH_SECRET, // ✅ REQUIRED in production

  callbacks: {
    async session({ session, token }: { session: Session; token: any }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }): Promise<string> {
      return `${baseUrl}/interview`; // redirect to /app/interview after login
    },
  },

  // Optional: if you have a custom login page
  // pages: {
  //   signIn: "/login",
  // },
};
