/**
 * Single source of truth for motion policy. Components must not query the
 * media query themselves.
 *
 * Defaults to `true` (reduced) so nothing autoplays during SSR/hydration
 * before the real preference is known.
 */
export function useReducedMotion() {
  const prefersReducedMotion = useState('reduced-motion', () => true)

  onMounted(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = query.matches

    const onChange = (event: MediaQueryListEvent) => {
      prefersReducedMotion.value = event.matches
    }

    query.addEventListener('change', onChange)
    onBeforeUnmount(() => query.removeEventListener('change', onChange))
  })

  return prefersReducedMotion
}
