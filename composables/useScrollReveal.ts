/**
 * Reveals an element once when it enters the viewport.
 *
 * The hidden state is applied from script, not from the server-rendered class
 * list, so the content is visible by default and stays visible if JS fails or
 * the visitor prefers reduced motion.
 */
export function useScrollReveal(target: Ref<HTMLElement | null>, delay = 0) {
  onMounted(() => {
    const element = target.value
    if (!element) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!('IntersectionObserver' in window)) return

    element.dataset.reveal = 'pending'

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          window.setTimeout(() => {
            element.dataset.reveal = 'shown'
          }, delay)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    )

    observer.observe(element)
    onBeforeUnmount(() => observer.disconnect())
  })
}
