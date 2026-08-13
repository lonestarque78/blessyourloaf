'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/layout/LanguageSwitcher'

interface DashboardNavClientProps {
  signOut: () => Promise<void>
}

const linkClass = 'font-lora text-sm text-[#7a4f3a] hover:text-[#b07d62] transition-colors'
const mobileLinkClass = 'font-lora text-base text-[#7a4f3a] hover:text-[#b07d62] transition-colors py-1'
const dropdownItemClass = 'block px-4 py-2 font-lora text-sm text-[#7a4f3a] hover:text-[#b07d62] hover:bg-[#fdf6f0] transition-colors'
const mobileSectionLabelClass = 'font-lora text-xs uppercase tracking-widest text-[#b8896e] mt-1'

// Shared open/close/click-outside behavior for the desktop dropdowns (Library, Kitchen
// Help) — extracted once there were two of these with identical logic, rather than copying
// the hover-intent timer and outside-click listener a second time.
//
// The trigger button's onClick intentionally calls `open`, not a toggle: a real mouse click
// fires `mouseenter` (opening the menu via hover) before the `click` event itself, so a
// toggle handler would read the just-opened state and immediately flip it back closed —
// the menu would visually flicker open-then-shut on every real click. `open` is idempotent,
// so hover-then-click just leaves it open. Closing already has two paths that don't need the
// button's own click to double as a close: the mouse-leave timer below, and the
// outside-click listener.
function useNavDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const open = useCallback(() => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    setIsOpen(true)
  }, [])

  const scheduleClose = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => setIsOpen(false), 150)
  }, [])

  const close = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return { isOpen, ref, open, scheduleClose, close }
}

export default function DashboardNavClient({ signOut }: DashboardNavClientProps) {
  const t = useTranslations('Common.dashboardNav')
  const tCommon = useTranslations('Common.nav')
  const [mobileOpen, setMobileOpen] = useState(false)
  const {
    isOpen: libraryOpen, ref: libraryRef, open: openLibrary, scheduleClose: scheduleCloseLibrary,
    close: closeLibrary,
  } = useNavDropdown()
  const {
    isOpen: kitchenHelpOpen, ref: kitchenHelpRef, open: openKitchenHelp, scheduleClose: scheduleCloseKitchenHelp,
    close: closeKitchenHelp,
  } = useNavDropdown()

  return (
    <>
      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-6">
        <Link href="/dashboard/starters" className={linkClass}>{t('myStarters')}</Link>
        <Link href="/dashboard/scheduler" className={linkClass}>{t('bakeScheduler')}</Link>
        <Link href="/dashboard/history" className={linkClass}>{t('bakeHistory')}</Link>

        {/* Kitchen Help dropdown — the three quota-gated AI skills (troubleshoot, substitute,
            generate), grouped separately from Library's static reference content below. */}
        <div
          ref={kitchenHelpRef}
          className="relative"
          onMouseEnter={openKitchenHelp}
          onMouseLeave={scheduleCloseKitchenHelp}
        >
          <button
            className={`${linkClass} flex items-center gap-1`}
            onClick={openKitchenHelp}
            aria-expanded={kitchenHelpOpen}
          >
            {t('kitchenHelp')}
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${kitchenHelpOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className={`absolute right-0 top-full mt-1 bg-white border border-[#f0e4db] rounded-md shadow-md py-2 min-w-[200px] z-50 transition-all duration-150 ${
            kitchenHelpOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1 pointer-events-none'
          }`}>
            <Link href="/dashboard/troubleshooter" className={dropdownItemClass} onClick={closeKitchenHelp}>
              {t('troubleshooter')}
            </Link>
            <Link href="/dashboard/ingredient-substitution" className={dropdownItemClass} onClick={closeKitchenHelp}>
              {t('ingredientSubstitution')}
            </Link>
            <Link href="/dashboard/my-recipes/new?focus=generate" className={dropdownItemClass} onClick={closeKitchenHelp}>
              {t('generateRecipe')}
            </Link>
          </div>
        </div>

        {/* Library dropdown */}
        <div
          ref={libraryRef}
          className="relative"
          onMouseEnter={openLibrary}
          onMouseLeave={scheduleCloseLibrary}
        >
          <button
            className={`${linkClass} flex items-center gap-1`}
            onClick={openLibrary}
            aria-expanded={libraryOpen}
          >
            {t('library')}
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
            <Link href="/dashboard/my-recipes" className={dropdownItemClass} onClick={closeLibrary}>
              {t('myRecipes')}
            </Link>
            <Link href="/recipes" className={dropdownItemClass} onClick={closeLibrary}>
              {t('recipes')}
            </Link>
            <Link href="/discard" className={dropdownItemClass} onClick={closeLibrary}>
              {t('discardVault')}
            </Link>
            <Link href="/flour-guide" className={dropdownItemClass} onClick={closeLibrary}>
              {t('flourGuide')}
            </Link>
            <Link href="/starter-guide" className={dropdownItemClass} onClick={closeLibrary}>
              {t('starterGuide')}
            </Link>
            <Link href="/hydration-calculator" className={dropdownItemClass} onClick={closeLibrary}>
              {t('hydrationCalculator')}
            </Link>
            <Link href="/temperature-guide" className={dropdownItemClass} onClick={closeLibrary}>
              {t('temperatureGuide')}
            </Link>
          </div>
        </div>

        <Link href="/dashboard/account" className={linkClass}>{t('account')}</Link>
        <LanguageSwitcher />
        <form action={signOut}>
          <button type="submit" className="font-lora text-sm text-[#9a7060] hover:text-[#b07d62] transition-colors">
            {t('signOut')}
          </button>
        </form>
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-md hover:bg-[#f0e0d0]/60 transition-colors"
        onClick={() => setMobileOpen(o => !o)}
        aria-label={mobileOpen ? tCommon('closeMenu') : tCommon('openMenu')}
      >
        <span className={`block w-5 h-0.5 bg-[#7a4f3a] transition-all duration-300 origin-center ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`block w-5 h-0.5 bg-[#7a4f3a] transition-all duration-300 ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
        <span className={`block w-5 h-0.5 bg-[#7a4f3a] transition-all duration-300 origin-center ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>

      {/* Mobile dropdown — max-height is viewport-relative with internal scrolling (rather
          than the old fixed max-h-[520px], which this list was already close to and would
          have started silently clipping unreachable links off the bottom, not scrolling to
          them, the next time an item was added). The transition still animates smoothly
          between 0 and that viewport-relative value. */}
      <div className={`md:hidden absolute left-0 right-0 top-full bg-white border-b border-[#f0e4db] shadow-md overflow-hidden transition-all duration-300 ease-in-out ${
        mobileOpen ? 'max-h-[calc(100vh-4rem)] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-6 pt-3 pb-6 flex flex-col gap-4 border-t border-[#f0e4db] overflow-y-auto max-h-[calc(100vh-4rem)]">
          <Link href="/dashboard/starters" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>{t('myStarters')}</Link>
          <Link href="/dashboard/scheduler" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>{t('bakeScheduler')}</Link>
          <Link href="/dashboard/history" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>{t('bakeHistory')}</Link>
          <Link href="/dashboard/my-recipes" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>{t('myRecipes')}</Link>

          <div className="border-t border-[#f0e4db] pt-3 flex flex-col gap-3">
            <span className={mobileSectionLabelClass}>{t('kitchenHelp')}</span>
            <Link href="/dashboard/troubleshooter" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>{t('troubleshooter')}</Link>
            <Link href="/dashboard/ingredient-substitution" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>{t('ingredientSubstitution')}</Link>
            <Link href="/dashboard/my-recipes/new?focus=generate" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>{t('generateRecipe')}</Link>
          </div>

          <div className="border-t border-[#f0e4db] pt-3 flex flex-col gap-3">
            <span className={mobileSectionLabelClass}>{t('library')}</span>
            <Link href="/recipes" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>{t('recipes')}</Link>
            <Link href="/discard" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>{t('discardVault')}</Link>
            <Link href="/flour-guide" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>{t('flourGuide')}</Link>
            <Link href="/starter-guide" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>{t('starterGuide')}</Link>
            <Link href="/hydration-calculator" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>{t('hydrationCalculator')}</Link>
            <Link href="/temperature-guide" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>{t('temperatureGuide')}</Link>
          </div>

          <div className="border-t border-[#f0e4db] pt-3 flex flex-col gap-4">
            <LanguageSwitcher />
            <Link href="/dashboard/account" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>{t('account')}</Link>
            <form action={signOut}>
              <button type="submit" className="font-lora text-base text-[#9a7060] hover:text-[#b07d62] transition-colors py-1">
                {t('signOut')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
