'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-8 md:px-12 py-4 flex items-center justify-between ${
      scrolled ? 'bg-[#fdf6f0]/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
    }`}>
      <Link href="/" className="flex items-center gap-2">
        <span className="text-2xl">🍞</span>
        <span className="font-playfair text-xl font-bold text-[#3d2b1f]">Bless Your Loaf</span>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        <Link href="/recipes" className="font-lora text-sm text-[#7a4f3a] hover:text-[#b07d62] transition-colors">Recipes</Link>
        <Link href="/starter-guide" className="font-lora text-sm text-[#7a4f3a] hover:text-[#b07d62] transition-colors">Starter Guide</Link>
        <Link href="/discard" className="font-lora text-sm text-[#7a4f3a] hover:text-[#b07d62] transition-colors">Discard Vault</Link>
        <Link href="/pricing" className="font-lora text-sm text-[#7a4f3a] hover:text-[#b07d62] transition-colors">Pricing</Link>
        <Link href="/signup" className="bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-5 py-2 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-md">
          Join the Kitchen
        </Link>
      </div>
    </nav>
  )
}