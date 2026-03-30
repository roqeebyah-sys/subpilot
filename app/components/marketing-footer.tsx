import Link from 'next/link'

export default function MarketingFooter() {
  return (
    <footer className="border-t border-white/[0.06] px-4 md:px-8 py-8 bg-[#080808]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6 pb-6 border-b border-white/[0.06]">
          <div>
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity w-fit">
              <div className="w-[28px] h-[28px] rounded-[7px] bg-emerald-400 flex items-center justify-center flex-shrink-0">
                <svg width="14" height="10" viewBox="0 0 15 11" fill="none">
                  <path d="M1 9L4.5 5L7.5 7L11 3L14 1" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-base font-bold tracking-tight">
                User<span className="text-emerald-400">Retain</span>
              </span>
            </Link>
            <p className="text-xs text-white/50 mt-1.5 ml-0.5">Protect your MRR.</p>
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-row gap-x-8 gap-y-2 text-[15px] text-[#e8eaed]">
            <Link href="/#features"  className="hover:text-white transition-colors">Features</Link>
            <Link href="/#pricing"   className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/#faq"       className="hover:text-white transition-colors">FAQ</Link>
            <Link href="/auth/login" className="hover:text-white transition-colors">Log in</Link>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <span>© 2026 UserRetain. All rights reserved.</span>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms"   className="hover:text-white transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
            <a href="mailto:support@userretain.io" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
