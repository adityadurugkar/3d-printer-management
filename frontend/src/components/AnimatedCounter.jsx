import { useState, useEffect, useRef } from 'react'

export default function AnimatedCounter({ value, duration = 1500, suffix = '', prefix = '' }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const start = performance.now()
          const from = 0
          const to = Number(value)

          const animate = (now) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplay(Math.round(from + (to - from) * eased))
            if (progress < 1) requestAnimationFrame(animate)
          }

          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [value, duration])

  useEffect(() => {
    started.current = false
  }, [value])

  return <span ref={ref}>{prefix}{display.toLocaleString()}{suffix}</span>
}
