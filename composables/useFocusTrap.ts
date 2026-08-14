/**
 * Traps keyboard focus inside a container element while active.
 *
 * - Tab / Shift+Tab cycle through focusable descendants.
 * - Focus is moved to the first focusable element on activation.
 * - On deactivation, focus returns to `returnTo` (typically the trigger button).
 * - Escape key calls the provided `onEscape` callback.
 *
 * Only runs client-side; the watcher is a no-op during SSR.
 */
export function useFocusTrap(
  containerRef: Ref<HTMLElement | null>,
  active: Ref<boolean>,
  options: {
    returnTo?: Ref<HTMLElement | null>
    onEscape?: () => void
  } = {},
) {
  const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

  function getFocusable(): HTMLElement[] {
    if (!containerRef.value) return []
    return [...containerRef.value.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      (el) => el.offsetParent !== null,
    )
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      options.onEscape?.()
      return
    }

    if (e.key !== 'Tab') return

    const focusable = getFocusable()
    if (focusable.length === 0) {
      e.preventDefault()
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  watch(active, (isActive) => {
    if (!import.meta.client) return

    if (isActive) {
      nextTick(() => {
        const focusable = getFocusable()
        if (focusable.length > 0) focusable[0].focus()
      })
      document.addEventListener('keydown', onKeydown)
    } else {
      document.removeEventListener('keydown', onKeydown)
      options.returnTo?.value?.focus()
    }
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKeydown)
  })
}
