import "./globals.css";
import NextAuthSessionProvider from "@/components/SessionProvider";


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
           {children}
          </div>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
