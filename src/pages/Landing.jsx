import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FiArrowRight, FiCheckCircle, FiMail, FiInstagram,
  FiBookOpen, FiUsers, FiTrendingUp, FiCalendar, FiStar
} from 'react-icons/fi'

const NAV_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'educators', label: 'Educators' },
  { id: 'tuition', label: 'Tuition' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'contact', label: 'Contact' }
]

const SUBJECTS = [
  { level: 'LKG \u2013 UKG', focus: 'Phonics & Early Reading', days: 'Mon \u2013 Fri' },
  { level: 'Class I \u2013 V', focus: 'All Subjects, Foundation Building', days: 'Mon \u2013 Fri' },
  { level: 'Class VI \u2013 VIII', focus: 'Maths, Science, Language', days: 'Mon \u2013 Sat' },
  { level: 'Class IX \u2013 X', focus: 'Board Exam Preparation', days: 'Mon \u2013 Sat' },
  { level: 'Class XI \u2013 XII', focus: 'Maths & Science Streams', days: 'Mon \u2013 Sat' }
]

const EDUCATORS = [
  { name: 'Dr. Vijay Srinivasan', qualification: 'MA, MSc, NET, Ph.D.', experience: '18 Years Teaching Experience' },
  { name: 'Mrs. Swati Vijay', qualification: 'MA English Literature, B.Ed.', experience: '12 Years Teaching Experience' }
]

const TESTIMONIALS = [
  {
    quote: "I appreciate the individualized attention you give. It's clear you care about each student's progress. We never felt like we were in tuition; it felt more like home.",
    name: 'Lakshana',
    detail: 'Class XII student'
  },
  {
    quote: 'We have seen remarkable improvement in his results, and more importantly, in his confidence and approach to learning.',
    name: 'Prasanna',
    detail: 'Parent of Radhakrishnan'
  },
  {
    quote: 'It has been 4 months since Niha started attending, and I have seen a remarkable improvement in her academics. Their knowledge and teaching style are excellent. Highly recommended!',
    name: 'Saveetha Lakshmanan',
    detail: 'Parent of Niha'
  },
  {
    quote: "Swathi is a really good teacher with whom to learn Hindi. She made my daughter understand and learn in an easy way \u2014 we can see the progress in her.",
    name: 'Ramya',
    detail: 'Parent'
  },
  {
    quote: 'As a working parent, we do not have sufficient time to be attentive to our kid. After joining, I am so glad that my son gets the best support system from you.',
    name: 'A working parent',
    detail: 'Parent'
  },
  {
    quote: "They made even the toughest subjects like Math and Science easier to understand. My son's confidence and marks have improved a lot. Highly recommend for strong academic support.",
    name: 'A SPARK parent',
    detail: 'Parent'
  }
]

function Nav({ onNavClick }) {
  return (
    <div className="sticky top-0 z-40 bg-[#FDFCFA]/95 backdrop-blur border-b border-[#EAE7DF]">
      <div className="max-w-6xl mx-auto px-6 sm:px-16 py-5 flex items-center justify-between">
        <div className="font-extrabold text-xl tracking-tight text-[#14150F]">
          SPARK<span className="text-[#C65A2E]">.</span>
        </div>
        <nav className="hidden md:flex items-center gap-9 text-sm font-medium text-[#55534A]">
          {NAV_LINKS.map((link) => (
            <button key={link.id} onClick={() => onNavClick(link.id)} className="hover:text-[#14150F] transition-colors">
              {link.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-5 text-sm font-semibold">
          <Link to="/login" className="text-[#14150F] hover:text-[#C65A2E] transition-colors hidden sm:inline">Log in</Link>
          <Link to="/register" className="text-[#14150F] hover:text-[#C65A2E] transition-colors hidden sm:inline">Register</Link>
          <button
            onClick={() => onNavClick('contact')}
            className="bg-[#14150F] text-white px-5 py-2.5 rounded hover:bg-[#2A2B22] transition-colors"
          >
            Book a demo
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Landing() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="bg-[#FDFCFA] text-[#14150F]">
      <Nav onNavClick={scrollTo} />

      {/* ============ HOME / HERO ============ */}
      <section id="home" className="max-w-6xl mx-auto px-6 sm:px-16 pt-20 pb-28 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-xs font-bold tracking-widest text-[#C65A2E] uppercase mb-6">
            Coimbatore &middot; LKG through Class XII
          </p>
          <h1 className="font-extrabold text-5xl sm:text-6xl leading-[1.05] tracking-tight mb-7">
            Tuition that keeps you <span className="text-[#C65A2E]">in the loop.</span>
          </h1>
          <p className="text-lg text-[#55534A] leading-relaxed mb-10 max-w-md">
            Small batches, attentive teachers, and a parent portal that shows attendance,
            marks, and fees the moment they happen &mdash; not at the end of the month.
          </p>
          <div className="flex flex-wrap gap-4 mb-12">
            <button
              onClick={() => scrollTo('contact')}
              className="flex items-center gap-2 bg-[#14150F] text-white font-semibold px-7 py-4 rounded hover:bg-[#2A2B22] transition-colors"
            >
              Book a free demo class <FiArrowRight />
            </button>
            <button
              onClick={() => scrollTo('about')}
              className="font-semibold px-7 py-4 rounded border border-[#D9D6CC] hover:border-[#14150F] transition-colors"
            >
              How it works
            </button>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-3 text-sm text-[#77756A]">
            <span><b className="block text-xl font-extrabold text-[#14150F]">32</b>students enrolled</span>
            <span><b className="block text-xl font-extrabold text-[#14150F]">Mon&ndash;Sat</b>batch schedule</span>
            <span><b className="block text-xl font-extrabold text-[#14150F]">0</b>re-entry needed</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="bg-white border border-[#EAE7DF] rounded p-8">
            <div className="flex items-center justify-between mb-6 text-sm">
              <span className="font-extrabold">SPARK</span>
              <span className="text-[#77756A]">Aug 2026</span>
            </div>
            <div className="w-20 h-20 rounded-full border-[5px] border-[#C65A2E] flex items-center justify-center font-extrabold text-lg mb-5">
              94%
            </div>
            <p className="font-bold text-base mb-5">Class VIII &middot; Monthly Report</p>
            {[
              { label: 'English', pct: 86 },
              { label: 'Maths', pct: 80 },
              { label: 'Science', pct: 74 }
            ].map((s) => (
              <div key={s.label} className="mb-3">
                <div className="flex justify-between text-xs text-[#77756A] mb-1.5">
                  <span>{s.label}</span>
                </div>
                <div className="h-1 rounded-full bg-[#F1EEE5] overflow-hidden">
                  <div className="h-full bg-[#14150F]" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-5 mt-5 border-t border-[#EAE7DF] text-sm">
              <span className="text-[#77756A]">Fee Status</span>
              <span className="font-bold text-[#1F6F5C] flex items-center gap-1"><FiCheckCircle size={14} /> Paid</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ============ ABOUT ============ */}
      <section id="about" className="bg-white border-y border-[#EAE7DF] py-24">
        <div className="max-w-6xl mx-auto px-6 sm:px-16 grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-xs font-bold tracking-widest text-[#C65A2E] uppercase mb-4">About SPARK</p>
            <h2 className="font-extrabold text-3xl sm:text-4xl leading-tight mb-6">
              Small enough to know your child by name.
            </h2>
            <p className="text-[#55534A] leading-relaxed mb-4">
              SPARK is a neighbourhood tuition centre, not a franchise. Every batch stays
              small enough that teachers actually know how each student is doing &mdash; and
              every parent gets to see it too, through daily attendance, subject-wise marks,
              and fee records that update the moment they happen.
            </p>
            <p className="text-[#55534A] leading-relaxed">
              We built our own parent portal because report cards once a term weren't
              enough. If your child was absent today, or scored well on a surprise test,
              you'll know today &mdash; not at the next parent-teacher meeting.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { icon: FiUsers, title: 'Small Batches', body: 'Personal attention instead of a crowded classroom.' },
              { icon: FiTrendingUp, title: 'Live Visibility', body: 'Attendance, marks, and fees, updated in real time.' },
              { icon: FiBookOpen, title: 'LKG through XII', body: 'One centre that grows with your child, year after year.' },
              { icon: FiCheckCircle, title: 'No Re-Entry', body: 'Everything syncs straight from class to your phone.' }
            ].map((f) => (
              <div key={f.title} className="border border-[#EAE7DF] rounded p-5">
                <f.icon className="text-[#C65A2E] mb-3" size={20} />
                <p className="font-bold text-sm mb-1">{f.title}</p>
                <p className="text-xs text-[#77756A] leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ EDUCATORS ============ */}
      <section id="educators" className="py-24">
        <div className="max-w-6xl mx-auto px-6 sm:px-16">
          <p className="text-xs font-bold tracking-widest text-[#C65A2E] uppercase mb-4">Educators</p>
          <h2 className="font-extrabold text-3xl sm:text-4xl mb-12">Meet the people teaching your child.</h2>
          <div className="grid sm:grid-cols-2 max-w-2xl gap-6">
            {EDUCATORS.map((edu) => (
              <div key={edu.name} className="border border-[#EAE7DF] rounded p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[#F5EFE7] mx-auto mb-4 flex items-center justify-center text-[#C65A2E] font-extrabold text-xl">
                  {edu.name.replace(/^(Dr\.|Mrs\.|Mr\.)\s*/, '').charAt(0)}
                </div>
                <p className="font-bold">{edu.name}</p>
                <p className="text-xs text-[#77756A] mt-1">{edu.qualification}</p>
                <p className="text-xs text-[#C65A2E] font-semibold mt-1">{edu.experience}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TUITION ============ */}
      <section id="tuition" className="bg-white border-y border-[#EAE7DF] py-24">
        <div className="max-w-6xl mx-auto px-6 sm:px-16">
          <p className="text-xs font-bold tracking-widest text-[#C65A2E] uppercase mb-4">Tuition</p>
          <h2 className="font-extrabold text-3xl sm:text-4xl mb-12">What we teach, by class level.</h2>
          <div className="border border-[#EAE7DF] rounded overflow-hidden">
            {SUBJECTS.map((row, i) => (
              <div
                key={row.level}
                className={`grid sm:grid-cols-3 gap-2 px-6 py-5 items-center ${i !== 0 ? 'border-t border-[#EAE7DF]' : ''}`}
              >
                <p className="font-bold">{row.level}</p>
                <p className="text-sm text-[#55534A]">{row.focus}</p>
                <p className="text-sm text-[#77756A]">{row.days}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section id="testimonials" className="py-24">
        <div className="max-w-6xl mx-auto px-6 sm:px-16">
          <p className="text-xs font-bold tracking-widest text-[#C65A2E] uppercase mb-4">Testimonials</p>
          <h2 className="font-extrabold text-3xl sm:text-4xl mb-12">What parents say.</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="border border-[#EAE7DF] rounded p-6">
                <div className="flex gap-0.5 mb-3 text-[#C65A2E]">
                  {[...Array(5)].map((_, s) => <FiStar key={s} size={13} fill="currentColor" />)}
                </div>
                <p className="text-sm text-[#55534A] leading-relaxed mb-4">"{t.quote}"</p>
                <p className="text-xs font-bold">{t.name} <span className="font-normal text-[#9A9184]">&middot; {t.detail}</span></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CONTACT / BOOK A DEMO ============ */}
      <section id="contact" className="bg-[#14150F] text-white py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-extrabold text-3xl sm:text-4xl mb-4">Come see a class for yourself.</h2>
          <p className="text-white/60 mb-12 max-w-lg mx-auto">
            Book a free demo class, or reach out directly &mdash; we'll walk you through the
            centre and the portal together.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto text-left mb-12">
            <a href="mailto:sparktution22@gmail.com" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded p-5 transition-colors">
              <FiMail className="mb-3" size={18} />
              <p className="text-xs text-white/50 mb-0.5">Email us</p>
              <p className="font-semibold text-sm break-all">sparktution22@gmail.com</p>
            </a>
            <a href="https://www.instagram.com/spark.v_s1102" target="_blank" rel="noreferrer" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded p-5 transition-colors">
              <FiInstagram className="mb-3" size={18} />
              <p className="text-xs text-white/50 mb-0.5">Follow us</p>
              <p className="font-semibold text-sm">@spark.v_s1102</p>
            </a>
          </div>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-[#14150F] font-bold px-8 py-4 rounded hover:bg-[#EAE7DF] transition-colors"
          >
            Get started <FiArrowRight />
          </Link>
        </div>
      </section>

      <footer className="text-[#9A9184] text-sm py-8 border-t border-[#EAE7DF]">
        <div className="max-w-6xl mx-auto px-6 sm:px-16 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-bold text-[#14150F]">SPARK</span>
          <span>&copy; {new Date().getFullYear()} SPARK Tuition Centre. Educate &middot; Empower &middot; Enrich.</span>
        </div>
      </footer>
    </div>
  )
}
