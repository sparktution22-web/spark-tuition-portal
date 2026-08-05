import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

/**
 * Counts up from 0 to `value` once it scrolls into view.
 * Reusable across the landing stats strip and dashboard summary cards.
 */
export default function AnimatedCounter({ value, duration = 1.4, prefix = '', suffix = '', decimals = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!isInView) return
    let start = null
    let frame

    const step = (timestamp) => {
      if (start === null) start = timestamp
      const progress = Math.min((timestamp - start) / (duration * 1000), 1)
      // ease-out-cubic for a natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(value * eased)
      if (progress < 1) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [isInView, value, duration])

  return (
    <span ref={ref} className="font-mono font-mono-nums">
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  )
}
