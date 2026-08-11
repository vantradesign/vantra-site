/**
 * Clipboard write with toast feedback and a short-lived `copied` flag for
 * inline button states. Falls back to a hidden textarea + execCommand so the
 * tools still work on http origins and in older Safari.
 */
export function useCopyToClipboard(resetAfter = 1800) {
  const copied = ref(false)
  const { push } = useToast()
  let timer: number | undefined

  async function write(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        return true
      }
    } catch {
      // Falls through to the textarea path below.
    }

    try {
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(area)
      return ok
    } catch {
      return false
    }
  }

  async function copy(text: string, message = 'Copied to clipboard') {
    const ok = await write(text)

    if (!ok) {
      push('Could not access the clipboard — select and copy manually.', 'error')
      return false
    }

    copied.value = true
    push(message)

    if (timer) window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      copied.value = false
    }, resetAfter)

    return true
  }

  onBeforeUnmount(() => {
    if (timer) window.clearTimeout(timer)
  })

  return { copy, copied }
}
