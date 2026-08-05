import sparkLogo from '../../assets/spark-logo.png'
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="bg-spark-ink text-white/70">
      <div className="max-w-7xl mx-auto px-5 py-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <img src={sparkLogo} alt="SPARK" className="h-8 w-auto mb-3 brightness-0 invert opacity-90" />
          <p className="text-sm text-white/50 max-w-xs">
            Educate • Empower • Enrich. One live view of attendance, fees and marks for admins, parents and students.
          </p>
        </div>

        <div>
          <h4 className="text-white font-display font-bold text-sm mb-4">Product</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#features" className="hover:text-spark-orange transition-colors">Features</a></li>
            <li><a href="#stats" className="hover:text-spark-orange transition-colors">How it works</a></li>
            <li><a href="#faqs" className="hover:text-spark-orange transition-colors">FAQs</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-display font-bold text-sm mb-4">Roles</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#login" className="hover:text-spark-orange transition-colors">Admin login</a></li>
            <li><a href="#login" className="hover:text-spark-orange transition-colors">Parent login</a></li>
            <li><a href="#login" className="hover:text-spark-orange transition-colors">Student login</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-display font-bold text-sm mb-4">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2"><FiMail className="text-spark-orange" /> hello@sparktuition.app</li>
            <li className="flex items-center gap-2"><FiPhone className="text-spark-orange" /> +91 00000 00000</li>
            <li className="flex items-center gap-2"><FiMapPin className="text-spark-orange" /> Kerala, India</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} SPARK. All rights reserved.</p>
          <p>Educate · Empower · Enrich</p>
        </div>
      </div>
    </footer>
  )
}
