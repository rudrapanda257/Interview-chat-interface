"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut, User, Zap } from "lucide-react"
import { useState, useEffect } from "react"

export default function Navbar() {
  const { data: session } = useSession()

  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20
      setScrolled(isScrolled)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  const isActiveLink = (href: string) => pathname === href

  const navLinks = [
    { href: "/interview", label: "Interviews" },
    { href: "/transcripts", label: "Transcripts" }
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-300 ease-in-out ${
            scrolled ? 'h-14' : 'h-16'
          }`}>
            {/* Logo with enhanced styling */}
            <div className="flex-shrink-0">
              <Link 
                href="/interview" 
                className="group flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-all duration-300"
              >
                <div className="relative">
                  <Zap className="w-6 h-6 text-blue-600 group-hover:text-blue-700 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                  <div className="absolute inset-0 bg-blue-400 rounded-full opacity-0 group-hover:opacity-20 blur-md transition-all duration-300 group-hover:scale-150"></div>
                </div>
                <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-blue-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:via-blue-700 group-hover:to-purple-600 transition-all duration-300">
                  Interview App
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group ${
                    isActiveLink(link.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  {link.label}
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform origin-left transition-transform duration-300 ${
                    isActiveLink(link.href) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}></span>
                </Link>
              ))}
            </div>

            {/* User Section */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              {session?.user ? (
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-300 ${
                    scrolled ? 'transform hover:scale-105' : ''
                  }`}>
                    {session.user.image ? (
                      <div className="relative">
                        <img
                          src={session.user.image}
                          alt={session.user.name || "User"}
                          className="w-8 h-8 rounded-full ring-2 ring-white shadow-sm hover:ring-blue-200 transition-all duration-300"
                        />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center hover:from-blue-200 hover:to-purple-200 transition-all duration-300">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                    <div className="hidden lg:block text-sm">
                      <div className="font-medium text-gray-900">{session.user.name}</div>
                      <div className="text-gray-500 truncate max-w-32">{session.user.email}</div>
                    </div>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="group text-red-600 border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 transform hover:scale-105 active:scale-95"
                  >
                    <LogOut className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 active:scale-95 transition-all duration-300">
                  <Link href="/login">Sign In</Link>
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-all duration-200 transform hover:scale-110 active:scale-95"
                aria-expanded={mobileOpen}
                aria-label="Toggle navigation menu"
              >
                <div className="relative w-6 h-6">
                  <Menu className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${
                    mobileOpen ? 'opacity-0 rotate-180' : 'opacity-100 rotate-0'
                  }`} />
                  <X className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${
                    mobileOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'
                  }`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-lg">
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 transform hover:scale-105 ${
                    isActiveLink(link.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {link.label}
                </Link>
              ))}
              
              {session?.user && (
                <div className="pt-3 border-t border-gray-200 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center space-x-3 px-3 py-2 mb-3 hover:bg-gray-50 rounded-lg transition-all duration-300">
                    {session.user.image ? (
                      <div className="relative">
                        <img
                          src={session.user.image}
                          alt={session.user.name || "User"}
                          className="w-10 h-10 rounded-full ring-2 ring-white shadow-sm"
                        />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                    )}
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{session.user.name}</div>
                      <div className="text-gray-500">{session.user.email}</div>
                    </div>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full group text-red-600 border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 transform hover:scale-105 active:scale-95"
                  >
                    <LogOut className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                    Sign Out
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div className={`fixed inset-0 z-40 bg-black transition-all duration-300 md:hidden ${
        mobileOpen ? 'bg-opacity-25 visible' : 'bg-opacity-0 invisible'
      }`}
      onClick={() => setMobileOpen(false)}
      aria-hidden="true"
      />

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-8"></div>
    </>
  )
}