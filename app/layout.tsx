// app/layout.tsx
import "./globals.css";
// import Navbar from "@/components/Navbar";
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
          {/* Your content here */}
           {children}
          </div>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
