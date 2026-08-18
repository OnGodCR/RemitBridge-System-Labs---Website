import { useEffect, useRef, useState } from 'react'

/** True when the user has asked their OS to reduce motion. */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}

/**
 * Fires once when an element scrolls into view, then stops observing.
 *
 * Deliberately one-shot: replaying an animation every time something scrolls
 * past turns a nice reveal into a nuisance on the second pass.
 */
export function useInView({ fallbackMs = 1800, ...options } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let done = false
    let timer
    const reveal = () => {
      if (done) return
      done = true
      clearInterval(timer)
      setInView(true)
    }

    // Already on screen at mount — reveal without waiting for a scroll that
    // may never come, e.g. on a short page or a deep link.
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) reveal()

    let observer
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            reveal()
            observer.disconnect()
          }
        },
        { rootMargin: '0px 0px -15% 0px', threshold: 0.2, ...options },
      )
      observer.observe(el)
    }

    /*
     * Safety net. If the observer never fires — unsupported, throttled, or a
     * rendering context that does not composite — the numbers would otherwise
     * stay at zero permanently. Content must not depend on an animation to
     * become readable.
     *
     * It checks visibility before acting. The old version revealed on a plain
     * timeout, which meant everything below the fold revealed 1.8s after MOUNT,
     * off screen, and the scroll-triggered animation was effectively dead: by
     * the time you scrolled to a section its bars had already grown. Desktop
     * masked it because the first animated band is often on the first screen;
     * on a phone nothing is, so every animation appeared broken.
     */
    timer = setInterval(() => {
      const r = el.getBoundingClientRect()
      if (r.top < window.innerHeight && r.bottom > 0) reveal()
    }, fallbackMs)

    return () => {
      clearInterval(timer)
      observer?.disconnect()
    }
  }, [fallbackMs])

  return [ref, inView]
}

/**
 * Counts from 0 to `value` once the element is in view.
 * Returns the final value immediately when motion is reduced.
 */
export function useCountUp(value, { duration = 1100, decimals = 0 } = {}) {
  const [ref, inView] = useInView()
  const reduced = usePrefersReducedMotion()
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (reduced) {
      setDisplay(value)
      return
    }

    let raf
    const start = performance.now()
    // Ease-out cubic: fast at first, settling into the final number.
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Number((value * eased).toFixed(decimals)))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, reduced, value, duration, decimals])

  return [ref, display, inView]
}
