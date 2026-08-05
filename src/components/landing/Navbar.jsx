import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import sparkLogo from '../../assets/spark-logo.png'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#stats' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'FAQs', href: '#faqs' },
  { label: 'Contact', href: '#contact' }
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-2' : 'py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5">
        <div
          className={`glass rounded-xl3 flex items-center justify-between px-4 sm:px-6 transition-all duration-300 ${
            scrolled ? 'py-2 shadow-card' : 'py-3'
          }`}
        >
          <a href="#" className="flex items-center gap-2 shrink-0" aria-label="SPARK home">
            <img src={sparkLogo} alt="SPARK" className="h-8 sm:h-9 w-auto" />
          </a>

          <nav className="hidden md:flex items-center gap-7" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-spark-ink/70 hover:text-spark-orange transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a
              href="#login"
              className="text-sm font-semibold px-4 py-2 rounded-full text-spark-ink/80 hover:text-spark-orange transition-colors"
            >
              Log in
            </a>
            <a
              href="#register"
              className="text-sm font-semibold px-5 py-2.5 rounded-full bg-spark-gradient text-white shadow-soft hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
            >
              Register
            </a>
          </div>

          <button
            className="md:hidden p-2 rounded-full hover:bg-spark-peach transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span className="sr-only">Toggle menu</span>
            <div className="w-5 flex flex-col gap-1.5">
              <span
                className={`h-0.5 bg-spark-ink rounded-full transition-transform ${mobileOpen ? 'translate-y-2 rotate-45' : ''}`}
              />
              <span className={`h-0.5 bg-spark-ink rounded-full transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
              <span
                className={`h-0.5 bg-spark-ink rounded-full transition-transform ${mobileOpen ? '-translate-y-2 -rotate-45' : ''}`}
              />
            </div>
          </button>
        </div>

        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass rounded-xl2 mt-2 px-6 py-4 flex flex-col gap-4"
            aria-label="Mobile"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-semibold text-spark-ink/80"
              >
                {link.label}
              </a>
            ))}
            <div className="flex gap-3 pt-2">
              <a href="#login" className="flex-1 text-center text-sm font-semibold px-4 py-2.5 rounded-full border border-spark-ink/10">
                Log in
              </a>
              <a
                href="#register"
                className="flex-1 text-center text-sm font-semibold px-4 py-2.5 rounded-full bg-spark-gradient text-white"
              >
                Register
              </a>
            </div>
          </motion.nav>
        )}
      </div>
    </motion.header>
  )
}
