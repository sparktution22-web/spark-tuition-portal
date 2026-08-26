import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FiArrowRight, FiCheckCircle, FiMail, FiInstagram,
  FiBookOpen, FiUsers, FiTrendingUp, FiStar,
  FiLayers, FiUser, FiAward, FiMessageCircle, FiGlobe, FiFileText
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import sparkLogo from '../assets/spark-logo.png'

const ICON_MAP = { FiBookOpen, FiLayers, FiUser, FiAward, FiMessageCircle, FiGlobe, FiFileText }

// Real WhatsApp number for the floating contact button and Contact section.
const WHATSAPP_NUMBER = '919502590645'

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

const PROGRAMS = [
  { title: 'Phonics Program', body: 'Letter sounds and formation, blending and reading, tricky words, interactive worksheets, songs, and more.', tag: 'Ages 4+', icon: 'FiBookOpen' },
  { title: 'KG \u2013 XII, All Subjects', body: 'Full academic support across every subject, year after year.', icon: 'FiLayers' },
  { title: 'Individual Subject Tuition', body: 'Focused, one-subject coaching for students who need it.', icon: 'FiUser' },
  { title: 'Special Coaching \u2014 Maths & Hindi', body: 'Extra, focused support in the two subjects students ask for most.', icon: 'FiAward' },
  { title: 'Spoken English', body: 'Confidence and fluency for everyday and academic conversation.', icon: 'FiMessageCircle' },
  { title: 'Spoken Hindi', body: 'Practical, conversational Hindi.', icon: 'FiMessageCircle' },
  { title: 'Spoken Telugu', body: 'Practical, conversational Telugu.', icon: 'FiMessageCircle' },
  { title: 'Tamil', body: 'Reading, writing, and conversation.', icon: 'FiGlobe' },
  { title: 'Hindi Exams', body: 'Madhyama, Prathamika, and Parichaya exam preparation.', icon: 'FiFileText' }
]

const TESTIMONIALS = [
  { quote: "I appreciate the individualized attention you give. It's clear you care about each student's progress. We never felt like we were in tuition; it felt more like home.", name: 'Lakshana', detail: 'Class XII student' },
  { quote: 'We have seen remarkable improvement in his results, and more importantly, in his confidence and approach to learning.', name: 'Prasanna', detail: 'Parent of Radhakrishnan' },
  { quote: 'It has been 4 months since Niha started attending, and I have seen a remarkable improvement in her academics. Their knowledge and teaching style are excellent. Highly recommended!', name: 'Saveetha Lakshmanan', detail: 'Parent of Niha' },
  { quote: "Swathi is a really good teacher with whom to learn Hindi. She made my daughter understand and learn in an easy way \u2014 we can see the progress in her.", name: 'Ramya', detail: 'Parent' },
  { quote: 'As a working parent, we do not have sufficient time to be attentive to our kid. After joining, I am so glad that my son gets the best support system from you.', name: 'A working parent', detail: 'Parent' },
  { quote: "They made even the toughest subjects like Math and Science easier to understand. My son's confidence and marks have improved a lot. Highly recommend for strong academic support.", name: 'A SPARK parent', detail: 'Parent' }
]

function Nav({ onNavClick }) {
  return (
    <div className="sticky top-0 z-40 bg-[#0F1420]/95 backdrop-blur border-b border-[#232B3D]">
      <div className="max-w-6xl mx-auto px-6 sm:px-16 py-4 flex items-center justify-between">
        <img src={sparkLogo} alt="SPARK — Educate, Empower, Enrich" className="h-7 sm:h-10 w-auto" />
        <nav className="hidden md:flex items-center gap-9 text-sm font-medium text-[#9AA3B5]">
          {NAV_LINKS.map((link) => (
            <button key={link.id} onClick={() => onNavClick(link.id)} className="hover:text-[#EDEBE4] transition-colors">
              {link.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3 sm:gap-5 text-xs sm:text-sm font-semibold">
          <Link to="/login" className="text-[#EDEBE4] hover:text-[#E8B84B] transition-colors">Log in</Link>
          <Link to="/register" className="text-[#EDEBE4] hover:text-[#E8B84B] transition-colors">Register</Link>
          <button
            onClick={() => onNavClick('contact')}
            className="bg-[#E8B84B] text-[#0F1420] px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-md font-bold hover:bg-[#F0C563] transition-colors whitespace-nowrap"
          >
            Book a Demo
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
    <div className="bg-[#0F1420] text-[#EDEBE4]">
      <Nav onNavClick={scrollTo} />

      {/* ============ HOME / HERO ============ */}
      <section id="home" className="max-w-6xl mx-auto px-6 sm:px-16 pt-20 pb-28 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-xs font-bold tracking-widest text-[#E8B84B] uppercase mb-6 border-l-2 border-[#E8B84B] pl-3">
            A tuition centre that shows its work
          </p>
          <h1 className="font-extrabold text-5xl sm:text-6xl leading-[1.1] tracking-tight mb-7">
            Tuition that keeps you <span className="text-[#E8B84B]">in the loop.</span>
          </h1>
          <p className="text-lg text-[#9AA3B5] leading-relaxed mb-10 max-w-md">
            Small batches, attentive teachers, and a parent portal that shows attendance,
            marks, and fees the moment they happen &mdash; not at the end of the month.
          </p>
          <div className="flex flex-wrap gap-4 mb-12">
            <button
              onClick={() => scrollTo('contact')}
              className="flex items-center gap-2 bg-[#E8B84B] text-[#0F1420] font-bold px-7 py-4 rounded-md hover:bg-[#F0C563] transition-colors"
            >
              Book a Free Demo Class <FiArrowRight />
            </button>
            <button
              onClick={() => scrollTo('about')}
              className="font-semibold px-7 py-4 rounded-md border border-[#2E3750] hover:border-[#E8B84B] transition-colors"
            >
              How it works
            </button>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-3 text-sm text-[#9AA3B5]">
            <span><b className="block text-lg font-bold text-[#EDEBE4]">Online &amp; Offline</b>classes available</span>
            <span><b className="block text-lg font-bold text-[#EDEBE4]">Mon&ndash;Sat</b>batch schedule</span>
            <span><b className="block text-lg font-bold text-[#EDEBE4]">13 yrs</b>experience</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="bg-[#161D2E] border border-[#232B3D] rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6 text-sm text-[#9AA3B5]">
              <span className="font-bold text-[#E8B84B]">SPARK</span>
              <span>Aug 2026</span>
            </div>
            <div className="w-20 h-20 rounded-full border-[5px] border-[#E8B84B] flex items-center justify-center font-bold text-lg mb-5">
              94%
            </div>
            <p className="font-bold text-base mb-5">Class VIII &middot; Monthly Report</p>
            {[
              { label: 'English', pct: 86 },
              { label: 'Maths', pct: 80 },
              { label: 'Science', pct: 74 }
            ].map((s) => (
              <div key={s.label} className="mb-3">
                <div className="flex justify-between text-xs text-[#9AA3B5] mb-1.5">
                  <span>{s.label}</span>
                </div>
                <div className="h-1 rounded-full bg-[#232B3D] overflow-hidden">
                  <div className="h-full bg-[#E8B84B]" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-5 mt-5 border-t border-[#232B3D] text-sm">
              <span className="text-[#9AA3B5]">Fee Status</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1"><FiCheckCircle size={14} /> Paid</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ============ ABOUT ============ */}
      <section id="about" className="bg-[#0B0F18] border-y border-[#232B3D] py-24">
        <div className="max-w-6xl mx-auto px-6 sm:px-16 grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-xs font-bold tracking-widest text-[#E8B84B] uppercase mb-4">About SPARK</p>
            <h2 className="font-extrabold text-3xl sm:text-4xl leading-tight mb-6">
              Small enough to know your child by name.
            </h2>
            <p className="text-[#9AA3B5] leading-relaxed mb-4">
              SPARK is a trusted learning centre offering phonics and KG&ndash;XII support.
              With vast experience in teaching, we deliver interactive, personalised
              learning. We focus on building confidence, clarity, and strong foundations.
            </p>
            <p className="text-[#9AA3B5] leading-relaxed">
              13 years of experience effectively helping students excel academically
              and linguistically &mdash; and a parent portal that shows attendance, marks,
              and fees the moment they happen, not at the end of the month.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { icon: FiUsers, title: 'Small Batches', body: 'Personal attention instead of a crowded classroom.' },
              { icon: FiTrendingUp, title: 'Live Visibility', body: 'Attendance, marks, and fees, updated in real time.' },
              { icon: FiBookOpen, title: 'LKG through XII', body: 'One centre that grows with your child, year after year.' },
              { icon: FiCheckCircle, title: 'No Re-Entry', body: 'Everything syncs straight from class to your phone.' }
            ].map((f) => (
              <div key={f.title} className="border border-[#232B3D] rounded-xl p-5 bg-[#161D2E]">
                <f.icon className="text-[#E8B84B] mb-3" size={20} />
                <p className="font-bold text-sm mb-1">{f.title}</p>
                <p className="text-xs text-[#9AA3B5] leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ EDUCATORS ============ */}
      <section id="educators" className="py-24">
        <div className="max-w-6xl mx-auto px-6 sm:px-16">
          <p className="text-xs font-bold tracking-widest text-[#E8B84B] uppercase mb-4">Educators</p>
          <h2 className="font-extrabold text-3xl sm:text-4xl mb-12">Meet the people teaching your child.</h2>
          <div className="grid sm:grid-cols-2 max-w-2xl gap-6">
            {EDUCATORS.map((edu) => (
              <div key={edu.name} className="border border-[#232B3D] rounded-xl p-6 text-center bg-[#161D2E]">
                <div className="w-16 h-16 rounded-full bg-[#0F1420] border border-[#E8B84B]/40 mx-auto mb-4 flex items-center justify-center text-[#E8B84B] font-extrabold text-xl">
                  {edu.name.replace(/^(Dr\.|Mrs\.|Mr\.)\s*/, '').charAt(0)}
                </div>
                <p className="font-bold">{edu.name}</p>
                <p className="text-xs text-[#9AA3B5] mt-1">{edu.qualification}</p>
                <p className="text-xs text-[#E8B84B] font-semibold mt-1">{edu.experience}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TUITION ============ */}
      <section id="tuition" className="bg-[#0B0F18] border-y border-[#232B3D] py-24">
        <div className="max-w-6xl mx-auto px-6 sm:px-16">
          <p className="text-xs font-bold tracking-widest text-[#E8B84B] uppercase mb-4">Tuition</p>
          <h2 className="font-extrabold text-3xl sm:text-4xl mb-4">What we teach.</h2>
          <p className="text-[#9AA3B5] mb-12 max-w-lg">From first letter sounds to board exam prep, spoken languages to focused
            one-on-one coaching.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
            {PROGRAMS.map((p) => {
              const Icon = ICON_MAP[p.icon]
              return (
                <div key={p.title} className="border border-[#232B3D] rounded-xl p-6 bg-[#161D2E] hover:border-[#E8B84B] transition-colors">
                  <div className="w-10 h-10 rounded-full bg-[#0F1420] flex items-center justify-center mb-4">
                    <Icon className="text-[#E8B84B]" size={18} />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-bold">{p.title}</p>
                    {p.tag && <span className="text-[10px] font-bold text-[#E8B84B] bg-[#0F1420] px-2 py-0.5 rounded-full border border-[#E8B84B]/30">{p.tag}</span>}
                  </div>
                  <p className="text-sm text-[#9AA3B5] leading-relaxed">{p.body}</p>
                </div>
              )
            })}
          </div>

          <p className="text-xs font-bold tracking-widest text-[#E8B84B] uppercase mb-4">Batches by Class Level</p>
          <div className="border border-[#232B3D] rounded-xl overflow-hidden">
            {SUBJECTS.map((row, i) => (
              <div
                key={row.level}
                className={`grid sm:grid-cols-3 gap-2 px-6 py-5 items-center ${i !== 0 ? 'border-t border-[#232B3D]' : ''}`}
              >
                <p className="font-bold">{row.level}</p>
                <p className="text-sm text-[#9AA3B5]">{row.focus}</p>
                <p className="text-sm text-[#9AA3B5]/70">{row.days}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section id="testimonials" className="py-24">
        <div className="max-w-6xl mx-auto px-6 sm:px-16">
          <p className="text-xs font-bold tracking-widest text-[#E8B84B] uppercase mb-4">Testimonials</p>
          <h2 className="font-extrabold text-3xl sm:text-4xl mb-12">What parents say.</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="border border-[#232B3D] rounded-xl p-6 bg-[#161D2E]">
                <div className="flex gap-0.5 mb-3 text-[#E8B84B]">
                  {[...Array(5)].map((_, s) => <FiStar key={s} size={13} fill="currentColor" />)}
                </div>
                <p className="text-sm text-[#9AA3B5] leading-relaxed mb-4">"{t.quote}"</p>
                <p className="text-xs font-bold text-[#EDEBE4]">{t.name} <span className="font-normal text-[#9AA3B5]/70">&middot; {t.detail}</span></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CONTACT / BOOK A DEMO ============ */}
      <section id="contact" className="bg-[#161D2E] border-t border-[#232B3D] py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-extrabold text-3xl sm:text-4xl mb-4">Come see a class for yourself.</h2>
          <p className="text-[#9AA3B5] mb-12 max-w-lg mx-auto">
            Book a free demo class, or reach out directly &mdash; we'll walk you through the
            centre and the portal together.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto text-left mb-12">
            <a href="mailto:sparktution22@gmail.com" className="bg-[#0F1420] hover:bg-[#0B0F18] border border-[#232B3D] rounded-xl p-5 transition-colors">
              <FiMail className="mb-3 text-[#E8B84B]" size={18} />
              <p className="text-xs text-[#9AA3B5] mb-0.5">Email us</p>
              <p className="font-semibold text-sm break-all">sparktution22@gmail.com</p>
            </a>
            <a href="https://www.instagram.com/spark.v_s1102" target="_blank" rel="noreferrer" className="bg-[#0F1420] hover:bg-[#0B0F18] border border-[#232B3D] rounded-xl p-5 transition-colors">
              <FiInstagram className="mb-3 text-[#E8B84B]" size={18} />
              <p className="text-xs text-[#9AA3B5] mb-0.5">Follow us</p>
              <p className="font-semibold text-sm">@spark.v_s1102</p>
            </a>
          </div>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-[#E8B84B] text-[#0F1420] font-bold px-8 py-4 rounded-md hover:bg-[#F0C563] transition-colors"
          >
            Get started <FiArrowRight />
          </Link>
        </div>
      </section>

      <footer className="text-[#9AA3B5] text-sm py-8 border-t border-[#232B3D]">
        <div className="max-w-6xl mx-auto px-6 sm:px-16 flex flex-col sm:flex-row items-center justify-between gap-3">
          <img src={sparkLogo} alt="SPARK" className="h-7 w-auto opacity-80" />
          <span>&copy; {new Date().getFullYear()} SPARK Tuition Centre. Educate &middot; Empower &middot; Enrich.</span>
        </div>
      </footer>

      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I\u2019d like to know more about classes at SPARK.')}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] text-white font-semibold px-5 py-3.5 rounded-full shadow-lg hover:scale-105 transition-transform"
      >
        <FaWhatsapp size={20} /> <span className="hidden sm:inline">Message us</span>
      </a>
    </div>
  )
}
