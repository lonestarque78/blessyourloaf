'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface NavbarClientProps {
  user: { firstName: string } | null
}

const navLinks = [
  { href: '/recipes', label: 'Recipes' },
  { href: '/starter-guide', label: 'Starter Guide' },
  { href: '/discard', label: 'Discard Vault' },
  { href: '/flour-guide', label: 'Flour Guide' },
  { href: '/pricing', label: 'Pricing' },
]

export default function NavbarClient({ user }: NavbarClientProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <div ref={menuRef} className="fixed top-0 left-0 right-0 z-50">
      <nav className={`transition-all duration-300 px-8 md:px-12 py-4 flex items-center justify-between ${
        scrolled || menuOpen ? 'bg-[#fdf6f0]/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
        <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <span className="text-2xl">🍞</span>
          <span className="font-playfair text-xl font-bold text-[#3d2b1f]">Bless Your Loaf</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className="font-lora text-sm text-[#7a4f3a] hover:text-[#b07d62] transition-colors">{label}</Link>
          ))}
          {user ? (
            <>
              <span className="font-lora text-sm text-[#7a4f3a]">{user.firstName}</span>
              <Link href="/dashboard" className="bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-5 py-2 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-md">
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="font-lora text-sm text-[#7a4f3a] hover:text-[#b07d62] transition-colors">Log In</Link>
              <Link href="/signup" className="bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-5 py-2 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-md">
                Join the Kitchen
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-md hover:bg-[#f0e0d0]/60 transition-colors"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          <span className={`block w-5 h-0.5 bg-[#7a4f3a] transition-all duration-300 origin-center ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-[#7a4f3a] transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-[#7a4f3a] transition-all duration-300 origin-center ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </nav>

      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-[#fdf6f0]/95 backdrop-blur-md shadow-md ${
        menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-8 pt-2 pb-6 flex flex-col gap-4 border-t border-[#e8d5c4]">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="font-lora text-base text-[#7a4f3a] hover:text-[#b07d62] transition-colors py-1"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="border-t border-[#e8d5c4] pt-4 flex flex-col gap-3">
            {user ? (
              <>
                <span className="font-lora text-sm text-[#7a4f3a]">Hello, {user.firstName}</span>
                <Link
                  href="/dashboard"
                  className="bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-5 py-2.5 rounded-full font-lora text-sm text-center shadow-md"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="font-lora text-base text-[#7a4f3a] hover:text-[#b07d62] transition-colors py-1"
                  onClick={() => setMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-5 py-2.5 rounded-full font-lora text-sm text-center shadow-md"
                  onClick={() => setMenuOpen(false)}
                >
                  Join the Kitchen
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}