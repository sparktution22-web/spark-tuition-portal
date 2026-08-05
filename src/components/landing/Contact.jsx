import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'

export default function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm()
  const [sent, setSent] = useState(false)

  const onSubmit = async (data) => {
    // Placeholder submit handler — wire to the Apps Script "contact" endpoint
    // or a form service (Netlify Forms, Formspree) once deployed.
    await new Promise((res) => setTimeout(res, 700))
    setSent(true)
    reset()
  }

  return (
    <section id="contact" className="max-w-4xl mx-auto px-5 py-28">
      <div className="text-center mb-12">
        <span className="text-xs font-bold tracking-wide uppercase text-spark-orange">Get in touch</span>
        <h2 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl text-spark-ink">
          Ready to bring SPARK to your centre?
        </h2>
        <p className="mt-3 text-spark-ink/55">Tell us a bit about your centre and we'll set up your portal.</p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-xl3 shadow-card p-8 sm:p-10 grid sm:grid-cols-2 gap-5"
        noValidate
      >
        <div className="sm:col-span-1">
          <label htmlFor="name" className="text-xs font-semibold text-spark-ink/50 mb-1.5 block">
            Name
          </label>
          <input
            id="name"
            {...register('name', { required: 'Please enter your name' })}
            className="w-full px-4 py-3 rounded-xl border border-spark-ink/10 focus:border-spark-orange outline-none transition-colors"
            placeholder="Your name"
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        <div className="sm:col-span-1">
          <label htmlFor="email" className="text-xs font-semibold text-spark-ink/50 mb-1.5 block">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email', {
              required: 'Please enter your email',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' }
            })}
            className="w-full px-4 py-3 rounded-xl border border-spark-ink/10 focus:border-spark-orange outline-none transition-colors"
            placeholder="you@example.com"
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="message" className="text-xs font-semibold text-spark-ink/50 mb-1.5 block">
            Message
          </label>
          <textarea
            id="message"
            rows={4}
            {...register('message', { required: 'Tell us a little about your centre' })}
            className="w-full px-4 py-3 rounded-xl border border-spark-ink/10 focus:border-spark-orange outline-none transition-colors resize-none"
            placeholder="Number of students, current tools, anything else..."
          />
          {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
        </div>

        <div className="sm:col-span-2 flex items-center justify-between">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-7 py-3.5 rounded-full bg-spark-gradient text-white font-bold shadow-soft hover:shadow-card-hover hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {isSubmitting ? 'Sending...' : 'Send message'}
          </button>
          {sent && <span className="text-sm font-semibold text-emerald-600">Thanks — we'll be in touch soon.</span>}
        </div>
      </motion.form>
    </section>
  )
}
