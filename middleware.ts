// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: '/login', // your sign-in page
  },
});

export const config = { matcher: ['/chat'] };
