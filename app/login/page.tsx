"use client"
import { signIn } from "next-auth/react"
import { FcGoogle } from "react-icons/fc"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Sparkles, Zap } from "lucide-react"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn("google", { callbackUrl: "/interview" })
    } catch (error) {
      console.error("Sign-in error:", error)
    } finally {
      setIsLoading(false)
    }
  }


  return (
  <div className="relative min-h-screen overflow-hidden">
    <div
      className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-[1500ms] hover:scale-110"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1517336714731-489689fd1ca8')`,
        filter: 'brightness(0.7) contrast(1.1)',
      }}
    />

    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-indigo-900/80" />

    {/* Floating Particles */}
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }}
        />
      ))}
    </div>

    {/* Content Wrapper */}
    <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        
        {/* Logo & Title */}
        <div className={`text-center transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl animate-pulse">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text">
            Interview App
          </h1>
        </div>

        {/* Login Card */}
        <div className={`rounded-3xl border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl transition-all duration-1000 hover:scale-105 hover:bg-white/15 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          
          
          <div className="mb-8 space-y-2">
            <div className="flex justify-center gap-2">
              <span className="text-4xl"></span>
              <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-semibold text-white">Welcome </h2>
            <p className="text-sm text-gray-200">Sign in to access your interview dashboard </p>
          </div>

          <Button
            onClick={handleSignIn}
            disabled={isLoading}
            className="relative w-full rounded-2xl bg-white py-4 text-base font-semibold text-gray-900 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600" />
            <div className="relative z-10 flex items-center justify-center gap-3">
              {isLoading ? (
                <>
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <FcGoogle className="text-2xl size-6 group-hover:scale-110 transition-transform duration-300" />
                  <span className="transition-colors duration-300 group-hover:text-white">
                    Continue with Google
                  </span>
                </>
              )}
            </div>
            
            <div className="absolute inset-0 -top-2 -bottom-2 translate-x-[-200%] skew-x-[-12deg] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[200%]" />
          </Button>

          
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
          </div>
        </div>
        <div className={`text-center text-sm text-gray-400 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          By signing in, you agree to our{' '}
          <span className="cursor-pointer text-blue-400 underline hover:text-blue-300">Terms of Service</span>{' '}
          and{' '}
          <span className="cursor-pointer text-blue-400 underline hover:text-blue-300">Privacy Policy</span>
        </div>
      </div>
    </div>

    {/* Floating Animation Styles */}
    <style jsx>{`
      @keyframes float {
        0%, 100% {
          transform: translateY(0) rotate(0);
          opacity: 0.7;
        }
        50% {
          transform: translateY(-20px) rotate(180deg);
          opacity: 1;
        }
      }
      .animate-float {
        animation: float 6s ease-in-out infinite;
      }
    `}</style>
  </div>
);

}