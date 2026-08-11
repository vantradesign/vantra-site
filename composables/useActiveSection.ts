/**
 * Tracks which of a set of sections currently sits in the reading band of the
 * viewport, for the chapter register on long-form pages.
 *
 * IntersectionObserver only — no scroll listener, nothing on the main thread
 * per frame. The band (rootMargin) is deliberately narrow: a section becomes
 * current when its body crosses the middle of the screen, not when its first
 * pixel appears, which is what makes the register agree with what is being
 * read rather than with what is merely visible.
 *
 * Returns null until the first section enters the band, so nothing is
 * highlighted while the visitor is still on the opening spread.
 */
export function useActiveSection(ids: string[]) {
  const active = ref<string | null>(null)

  onMounted(() => {
    if (!('IntersectionObserver' in window)) return

    const visible = new Set<string>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }

        // Document order wins when two sections share the band.
        const current = ids.find((id) => visible.has(id))
        if (current) active.value = current
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 },
    )

    for (const id of ids) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }

    onBeforeUnmount(() => observer.disconnect())
  })

  return { active }
}
