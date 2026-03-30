'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function MarketingHeader() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0a0a]/90 backdrop-blur-xl">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex items-center justify-between h-20">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-[34px] h-[34px] rounded-[8px] bg-emerald-400 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/30">
            <svg width="17" height="12" viewBox="0 0 15 11" fill="none">
              <path d="M1 9L4.5 5L7.5 7L11 3L14 1" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight leading-none">
            User<span className="text-emerald-400">Retain</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-[15px] text-white/60">
          <Link href="/#features"  className="hover:text-white transition-colors">Features</Link>
          <Link href="/#how"       className="hover:text-white transition-colors">How it works</Link>
          <Link href="/#pricing"   className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/#faq"       className="hover:text-white transition-colors">FAQ</Link>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/auth/login"
            className="text-[15px] text-white/60 hover:text-white transition-colors px-4 py-2">
            Log in
          </Link>
          <Link href="/auth/signup"
            className="bg-emerald-400 hover:bg-emerald-300 text-black text-[15px] font-semibold px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-emerald-500/20">
            Get started free →
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
        <div className="md:hidden border-t border-white/[0.06] bg-[#0a0a0a] px-6 py-4 space-y-3">
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
