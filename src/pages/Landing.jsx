import Navbar from '../components/landing/Navbar.jsx'
import Hero from '../components/landing/Hero.jsx'
import Stats from '../components/landing/Stats.jsx'
import Features from '../components/landing/Features.jsx'
import Testimonials from '../components/landing/Testimonials.jsx'
import FAQ from '../components/landing/FAQ.jsx'
import Contact from '../components/landing/Contact.jsx'
import Footer from '../components/landing/Footer.jsx'

export default function Landing() {
  return (
    <div className="min-h-screen bg-spark-surface overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
