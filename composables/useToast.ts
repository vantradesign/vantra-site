export interface Toast {
  id: number
  message: string
  tone: 'neutral' | 'error'
}

/**
 * One shared queue for the whole app. State lives outside the composable so
 * every caller — and the single <ToastHost /> in app.vue — reads the same list.
 */
const toasts = ref<Toast[]>([])
let nextId = 0

export function useToast() {
  function dismiss(id: number) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function push(message: string, tone: Toast['tone'] = 'neutral', duration = 2600) {
    const id = ++nextId
    toasts.value = [...toasts.value, { id, message, tone }]

    if (import.meta.client) {
      window.setTimeout(() => dismiss(id), duration)
    }

    return id
  }

  return { toasts: readonly(toasts), push, dismiss }
}
