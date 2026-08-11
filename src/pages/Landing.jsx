import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FiArrowRight, FiCheckCircle, FiMail, FiInstagram,
  FiBookOpen, FiUsers, FiTrendingUp, FiCalendar, FiStar
} from 'react-icons/fi'

// ---- Folder-tab navigation — the page's signature element. Each
// section gets its own colored index-card tab, like a real student's
// subject folder, instead of a generic flat navbar. ----
const NAV_TABS = [
  { id: 'home', label: 'Home', color: 'bg-spark-orange' },
  { id: 'about', label: 'About', color: 'bg-[#1F6F5C]' },
  { id: 'educators', label: 'Educators', color: 'bg-[#F2B84B]' },
  { id: 'tuition', label: 'Tuition', color: 'bg-spark-orange' },
  { id: 'testimonials', label: 'Testimonials', color: 'bg-[#1F6F5C]' },
  { id: 'contact', label: 'Contact', color: 'bg-[#F2B84B]' }
]

const SUBJECTS = [
  { level: 'LKG \u2013 UKG', focus: 'Phonics & Early Reading', days: 'Mon \u2013 Fri' },
  { level: 'Class I \u2013 V', focus: 'All Subjects, Foundation Building', days: 'Mon \u2013 Fri' },
  { level: 'Class VI \u2013 VIII', focus: 'Maths, Science, Language', days: 'Mon \u2013 Sat' },
  { level: 'Class IX \u2013 X', focus: 'Board Exam Preparation', days: 'Mon \u2013 Sat' },
  { level: 'Class XI \u2013 XII', focus: 'Maths & Science Streams', days: 'Mon \u2013 Sat' }
]

function FolderTabNav({ activeId, onNavClick }) {
  const [scrolled, setScrolled] = useState(false)

  return (
    <div className="sticky top-0 z-40">
      {/* Tabs peeking above the bar */}
      <div className="hidden md:flex justify-center gap-1 px-6">
        {NAV_TABS.map((tab, i) => (
          <button
            key={tab.id}
            onClick={() => onNavClick(tab.id)}
            className={`${tab.color} text-white text-xs font-bold px-4 pt-2 pb-3 rounded-t-lg shadow-sm hover:-translate-y-0.5 transition-transform`}
            style={{ transform: `rotate(${i % 2 === 0 ? '-1' : '1'}deg)` }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-white/95 backdrop-blur border-b border-spark-ink/10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-xl text-spark-orange">SPARK</span>
            <span className="text-[10px] text-spark-ink/40 hidden sm:inline">Educate &middot; Empower &middot; Enrich</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-spark-ink/70">
            {NAV_TABS.map((tab) => (
              <button key={tab.id} onClick={() => onNavClick(tab.id)} className="hover:text-spark-orange transition-colors">
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-spark-ink hover:text-spark-orange transition-colors">
              Log in
            </Link>
            <Link to="/register" className="text-sm font-semibold text-spark-ink hover:text-spark-orange transition-colors hidden sm:inline">
              Register
            </Link>
            <button
              onClick={() => onNavClick('contact')}
              className="bg-spark-gradient text-white text-sm font-bold px-4 py-2 rounded-full shadow-soft hover:shadow-card-hover transition-all"
            >
              Book a Demo
            </button>
          </div>
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
    <div className="bg-[#FFF8EF] text-spark-ink">
      <FolderTabNav onNavClick={scrollTo} />

      {/* ============ HOME / HERO ============ */}
      <section id="home" className="relative overflow-hidden">
        {/* Ruled notebook lines, faint */}
        <div
          className="absolute inset-0 opacity-[0.35] pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 35px, #1F6F5C22 35px, #1F6F5C22 36px)'
          }}
        />
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-24 relative grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block bg-[#F2B84B]/20 text-[#8a6417] text-xs font-bold px-3 py-1.5 rounded-full mb-5">
              A TUITION CENTRE THAT SHOWS ITS WORK
            </span>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl leading-[1.08] mb-6">
              Every class, every mark,
              <br />
              <span className="relative inline-block">
                every rupee
                <svg className="absolute left-0 -bottom-1 w-full" height="10" viewBox="0 0 200 10" preserveAspectRatio="none">
                  <path d="M0,6 Q50,0 100,6 T200,6" stroke="#FF6B00" strokeWidth="6" fill="none" strokeLinecap="round" />
                </svg>
              </span>{' '}
              &mdash; visible to you, in real time.
            </h1>
            <p className="text-spark-ink/60 text-lg leading-relaxed mb-8 max-w-lg">
              SPARK is a Coimbatore tuition centre for LKG through Class XII. Small batches,
              attentive teaching, and a parent portal that shows attendance, marks, and fees
              the moment they're recorded &mdash; not at the end of the month.
            </p>
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <button
                onClick={() => scrollTo('contact')}
                className="flex items-center gap-2 bg-spark-gradient text-white font-bold px-6 py-3.5 rounded-full shadow-soft hover:shadow-card-hover transition-all"
              >
                Book a Free Demo Class <FiArrowRight />
              </button>
              <button
                onClick={() => scrollTo('about')}
                className="text-spark-ink font-semibold px-6 py-3.5 rounded-full border border-spark-ink/15 hover:border-spark-orange hover:text-spark-orange transition-colors"
              >
                How it works
              </button>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-spark-ink/50">
              <span className="flex items-center gap-1.5"><FiUsers size={14} /> 32 students, LKG&ndash;XII</span>
              <span className="flex items-center gap-1.5"><FiCalendar size={14} /> Mon&ndash;Sat batches</span>
              <span className="flex items-center gap-1.5"><FiCheckCircle size={14} /> No re-entry, no waiting</span>
            </div>
          </motion.div>

          {/* Report-card visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: -3 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative mx-auto max-w-sm"
          >
            <div className="bg-white rounded-2xl shadow-card-hover p-7 border border-spark-ink/5">
              <div className="flex items-center justify-between mb-5">
                <span className="font-display font-extrabold text-spark-orange">SPARK</span>
                <span className="text-[10px] text-spark-ink/40 font-mono">AUG 2026</span>
              </div>
              <p className="text-xs text-spark-ink/40 mb-1">Monthly Report</p>
              <p className="font-display font-bold text-lg mb-5">Class VIII Student</p>
              <div className="flex items-center gap-5 mb-5">
                <div className="relative w-20 h-20 rounded-full border-[6px] border-spark-orange flex items-center justify-center">
                  <span className="font-mono font-bold text-lg">94%</span>
                </div>
                <div className="flex-1 space-y-2">
                  {['English', 'Maths', 'Science'].map((s, i) => (
                    <div key={s}>
                      <p className="text-[10px] text-spark-ink/50 mb-0.5">{s}</p>
                      <div className="h-1.5 rounded-full bg-spark-peach overflow-hidden">
                        <div className="h-full bg-spark-gradient rounded-full" style={{ width: `${88 - i * 6}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-spark-ink/5">
                <span className="text-xs text-spark-ink/40">Fee Status</span>
                <span className="text-sm font-bold text-[#1F6F5C] flex items-center gap-1"><FiCheckCircle size={14} /> Paid</span>
              </div>
            </div>
            {/* marker-circle accent */}
            <svg className="absolute -top-4 -right-4 w-16 h-16 text-[#e04b1a] opacity-80" viewBox="0 0 100 100">
              <ellipse cx="50" cy="50" rx="46" ry="38" fill="none" stroke="currentColor" strokeWidth="5" transform="rotate(-8 50 50)" />
            </svg>
          </motion.div>
        </div>
      </section>

      {/* ============ ABOUT ============ */}
      <section id="about" className="bg-white border-y border-spark-ink/5 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-14 items-start">
            <div>
              <span className="text-xs font-bold text-[#1F6F5C] uppercase tracking-wide">About SPARK</span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl mt-2 mb-5">
                Small enough to know your child by name.
              </h2>
              <p className="text-spark-ink/60 leading-relaxed mb-4">
                SPARK is a neighbourhood tuition centre, not a franchise. Every batch stays
                small enough that teachers actually know how each student is doing &mdash; and
                every parent gets to see it too, through daily attendance, subject-wise marks,
                and fee records that update the moment they happen.
              </p>
              <p className="text-spark-ink/60 leading-relaxed">
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
                <div key={f.title} className="bg-[#FFF8EF] rounded-2xl p-5 border border-spark-ink/5">
                  <f.icon className="text-spark-orange mb-3" size={22} />
                  <p className="font-display font-bold text-sm mb-1">{f.title}</p>
                  <p className="text-xs text-spark-ink/50 leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ EDUCATORS ============ */}
      <section id="educators" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <span className="text-xs font-bold text-[#F2B84B] uppercase tracking-wide">Educators</span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl mt-2 mb-10">Meet the people teaching your child.</h2>
          <div className="grid sm:grid-cols-2 max-w-2xl gap-6">
            {[
              { name: 'Dr. Vijay Srinivasan', qualification: 'MA, MSc, NET, Ph.D.', experience: '18 Years Teaching Experience' },
              { name: 'Mrs. Swati Vijay', qualification: 'MA English Literature, B.Ed.', experience: '12 Years Teaching Experience' }
            ].map((edu) => (
              <div key={edu.name} className="bg-white rounded-2xl p-6 border border-spark-ink/5 shadow-card text-center">
                <div className="w-16 h-16 rounded-full bg-spark-peach mx-auto mb-4 flex items-center justify-center text-spark-orange font-display font-bold text-xl">
                  {edu.name.replace(/^(Dr\.|Mrs\.|Mr\.)\s*/, '').charAt(0)}
                </div>
                <p className="font-display font-bold text-spark-ink">{edu.name}</p>
                <p className="text-xs text-spark-ink/50 mt-1">{edu.qualification}</p>
                <p className="text-xs text-spark-orange font-semibold mt-1">{edu.experience}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TUITION ============ */}
      <section id="tuition" className="bg-white border-y border-spark-ink/5 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <span className="text-xs font-bold text-spark-orange uppercase tracking-wide">Tuition</span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl mt-2 mb-10">What we teach, by class level.</h2>
          <div className="overflow-hidden rounded-2xl border border-spark-ink/10">
            {SUBJECTS.map((row, i) => (
              <div
                key={row.level}
                className={`grid sm:grid-cols-3 gap-2 px-6 py-5 items-center ${i % 2 === 0 ? 'bg-[#FFF8EF]' : 'bg-white'}`}
              >
                <p className="font-display font-bold">{row.level}</p>
                <p className="text-sm text-spark-ink/60">{row.focus}</p>
                <p className="text-sm text-spark-ink/40">{row.days}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section id="testimonials" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <span className="text-xs font-bold text-[#1F6F5C] uppercase tracking-wide">Testimonials</span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl mt-2 mb-10">What parents say.</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                quote: "I appreciate the individualized attention you give. It's clear you care about each student's progress. We never felt like we were in tuition; it felt more like home.",
                name: 'Lakshana',
                detail: 'Class XII student'
              },
              {
                quote: "We have seen remarkable improvement in his results, and more importantly, in his confidence and approach to learning.",
                name: 'Prasanna',
                detail: "Parent of Radhakrishnan"
              },
              {
                quote: "It has been 4 months since Niha started attending, and I have seen a remarkable improvement in her academics. Their knowledge and teaching style are excellent. Highly recommended!",
                name: 'Saveetha Lakshmanan',
                detail: "Parent of Niha"
              },
              {
                quote: "Swathi is a really good teacher with whom to learn Hindi. She made my daughter understand and learn in an easy way \u2014 we can see the progress in her.",
                name: 'Ramya',
                detail: 'Parent'
              },
              {
                quote: "As a working parent, we do not have sufficient time to be attentive to our kid. After joining, I am so glad that my son gets the best support system from you.",
                name: 'A working parent',
                detail: 'Parent'
              },
              {
                quote: "They made even the toughest subjects like Math and Science easier to understand. My son's confidence and marks have improved a lot. Highly recommend for strong academic support.",
                name: 'A SPARK parent',
                detail: 'Parent'
              }
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-spark-ink/5 shadow-card">
                <div className="flex gap-0.5 mb-3 text-[#F2B84B]">
                  {[...Array(5)].map((_, s) => <FiStar key={s} size={14} fill="currentColor" />)}
                </div>
                <p className="text-sm text-spark-ink/70 leading-relaxed mb-4">"{t.quote}"</p>
                <p className="text-xs font-semibold text-spark-ink/50">{t.name} <span className="font-normal text-spark-ink/30">&middot; {t.detail}</span></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CONTACT / BOOK A DEMO ============ */}
      <section id="contact" className="bg-spark-gradient py-20">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl mb-3">Come see a class for yourself.</h2>
          <p className="text-white/80 mb-10 max-w-lg mx-auto">
            Book a free demo class, or reach out directly &mdash; we'll walk you through the
            centre and the portal together.
          </p>
          <div className="grid sm:grid-cols-2 gap-5 max-w-xl mx-auto text-left">
            <a href="mailto:sparktution22@gmail.com" className="bg-white/10 hover:bg-white/20 rounded-2xl p-5 transition-colors">
              <FiMail className="mb-3" size={20} />
              <p className="text-xs text-white/60 mb-0.5">Email us</p>
              <p className="font-semibold break-all">sparktution22@gmail.com</p>
            </a>
            <a href="https://www.instagram.com/spark.v_s1102" target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-white/20 rounded-2xl p-5 transition-colors">
              <FiInstagram className="mb-3" size={20} />
              <p className="text-xs text-white/60 mb-0.5">Follow us</p>
              <p className="font-semibold">@spark.v_s1102</p>
            </a>
          </div>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-spark-orange font-bold px-8 py-4 rounded-full mt-10 shadow-card-hover hover:scale-[1.02] transition-transform"
          >
            Get Started <FiArrowRight />
          </Link>
        </div>
      </section>

      <footer className="bg-[#17211C] text-white/50 text-sm py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-display font-bold text-white">SPARK</span>
          <span>&copy; {new Date().getFullYear()} SPARK Tuition Centre. Educate &middot; Empower &middot; Enrich.</span>
        </div>
      </footer>
    </div>
  )
}
