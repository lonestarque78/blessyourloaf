'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

interface DashboardNavClientProps {
  signOut: () => Promise<void>
}

const linkClass = 'font-lora text-sm text-[#7a4f3a] hover:text-[#b07d62] transition-colors'
const mobileLinkClass = 'font-lora text-base text-[#7a4f3a] hover:text-[#b07d62] transition-colors py-1'

export default function DashboardNavClient({ signOut }: DashboardNavClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const libraryRef = useRef<HTMLDivElement>(null)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openLibrary = useCallback(() => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    setLibraryOpen(true)
  }, [])

  const scheduleCloseLibrary = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => setLibraryOpen(false), 150)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (libraryRef.current && !libraryRef.current.contains(e.target as Node)) {
        setLibraryOpen(false)
      }
    }
    if (libraryOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [libraryOpen])

  return (
    <>
      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-6">
        <Link href="/dashboard/starters" className={linkClass}>My Starters</Link>
        <Link href="/dashboard/scheduler" className={linkClass}>Bake Scheduler</Link>
        <Link href="/dashboard/history" className={linkClass}>Bake History</Link>
        <Link href="/dashboard/troubleshooter" className={linkClass}>Troubleshooter</Link>

        {/* Library dropdown */}
        <div
          ref={libraryRef}
          className="relative"
          onMouseEnter={openLibrary}
          onMouseLeave={scheduleCloseLibrary}
        >
          <button
            className={`${linkClass} flex items-center gap-1`}
            onClick={() => setLibraryOpen(o => !o)}
            aria-expanded={libraryOpen}
          >
            Library
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${libraryOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className={`absolute right-0 top-full mt-1 bg-white border border-[#f0e4db] rounded-md shadow-md py-2 min-w-[148px] z-50 transition-all duration-150 ${
            libraryOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1 pointer-events-none'
          }`}>
            <Link
              href="/dashboard/my-recipes"
              className="block px-4 py-2 font-lora text-sm text-[#7a4f3a] hover:text-[#b07d62] hover:bg-[#fdf6f0] transition-colors"
              onClick={() => setLibraryOpen(false)}
            >
              My Recipes
            </Link>
            <Link
              href="/recipes"
              className="block px-4 py-2 font-lora text-sm text-[#7a4f3a] hover:text-[#b07d62] hover:bg-[#fdf6f0] transition-colors"
              onClick={() => setLibraryOpen(false)}
            >
              Recipes
            </Link>
            <Link
              href="/discard"
              className="block px-4 py-2 font-lora text-sm text-[#7a4f3a] hover:text-[#b07d62] hover:bg-[#fdf6f0] transition-colors"
              onClick={() => setLibraryOpen(false)}
            >
              Discard Vault
            </Link>
            <Link
              href="/flour-guide"
              className="block px-4 py-2 font-lora text-sm text-[#7a4f3a] hover:text-[#b07d62] hover:bg-[#fdf6f0] transition-colors"
              onClick={() => setLibraryOpen(false)}
            >
              Flour Guide
            </Link>
            <Link
              href="/starter-guide"
              className="block px-4 py-2 font-lora text-sm text-[#7a4f3a] hover:text-[#b07d62] hover:bg-[#fdf6f0] transition-colors"
              onClick={() => setLibraryOpen(false)}
            >
              Starter Guide
            </Link>
          </div>
        </div>

        <Link href="/dashboard/account" className={linkClass}>Account</Link>
        <form action={signOut}>
          <button type="submit" className="font-lora text-sm text-[#9a7060] hover:text-[#b07d62] transition-colors">
            Sign out
          </button>
        </form>
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-md hover:bg-[#f0e0d0]/60 transition-colors"
        onClick={() => setMobileOpen(o => !o)}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
      >
        <span className={`block w-5 h-0.5 bg-[#7a4f3a] transition-all duration-300 origin-center ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`block w-5 h-0.5 bg-[#7a4f3a] transition-all duration-300 ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
        <span className={`block w-5 h-0.5 bg-[#7a4f3a] transition-all duration-300 origin-center ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>

      {/* Mobile dropdown */}
      <div className={`md:hidden absolute left-0 right-0 top-full bg-white border-b border-[#f0e4db] shadow-md overflow-hidden transition-all duration-300 ease-in-out ${
        mobileOpen ? 'max-h-[480px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-6 pt-3 pb-6 flex flex-col gap-4 border-t border-[#f0e4db]">
          <Link href="/dashboard/starters" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>My Starters</Link>
          <Link href="/dashboard/scheduler" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>Bake Scheduler</Link>
          <Link href="/dashboard/history" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>Bake History</Link>
          <Link href="/dashboard/my-recipes" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>My Recipes</Link>
          <Link href="/dashboard/troubleshooter" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>Troubleshooter</Link>
          <Link href="/recipes" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>Recipes</Link>
          <Link href="/discard" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>Discard Vault</Link>
          <Link href="/flour-guide" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>Flour Guide</Link>
          <Link href="/starter-guide" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>Starter Guide</Link>
          <div className="border-t border-[#f0e4db] pt-3 flex flex-col gap-3">
            <Link href="/dashboard/account" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>Account</Link>
            <form action={signOut}>
              <button type="submit" className="font-lora text-base text-[#9a7060] hover:text-[#b07d62] transition-colors py-1">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
