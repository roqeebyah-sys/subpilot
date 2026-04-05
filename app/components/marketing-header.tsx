'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function MarketingHeader() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#080c14]/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-[60px]">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <svg width="13" height="9" viewBox="0 0 15 11" fill="none">
              <path d="M1 9L4.5 5L7.5 7L11 3L14 1" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-[15px] font-bold tracking-tight">
            User<span className="text-emerald-400">Retain</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
          <Link href="/#features"  className="hover:text-white transition-colors">Features</Link>
          <Link href="/#how"       className="hover:text-white transition-colors">How it works</Link>
          <Link href="/#pricing"   className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/#faq"       className="hover:text-white transition-colors">FAQ</Link>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/auth/login"
            className="text-sm text-white/50 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link href="/auth/signup"
            className="text-xs font-semibold text-black bg-emerald-400 hover:bg-emerald-300 px-4 py-2 rounded-lg transition-colors">
            Start free trial
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white/60 hover:text-white transition-colors p-1"
          onClick={() => setOpen(o => !o)}
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/[0.06] bg-[#080c14]/95 backdrop-blur-xl px-6 py-4 space-y-3">
          {[
            { label: 'Features',    href: '/#features' },
            { label: 'How it works',href: '/#how' },
            { label: 'Pricing',     href: '/#pricing' },
            { label: 'FAQ',         href: '/#faq' },
          ].map(l => (
            <Link key={l.label} href={l.href}
              className="block text-[15px] text-white/60 hover:text-white transition-colors py-1"
              onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <div className="pt-3 flex flex-col gap-2 border-t border-white/[0.06]">
            <Link href="/auth/login" className="text-[15px] text-center text-white/60 hover:text-white transition-colors py-2">Log in</Link>
            <Link href="/auth/signup" className="bg-emerald-400 text-black text-[15px] font-semibold text-center py-2.5 rounded-lg">Get started free →</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
