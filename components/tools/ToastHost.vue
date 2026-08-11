<script setup lang="ts">
const { toasts, dismiss } = useToast()
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4"
    aria-live="polite"
    aria-atomic="false"
  >
    <TransitionGroup
      enter-active-class="transition duration-300 ease-editorial"
      enter-from-class="opacity-0 translate-y-2"
      leave-active-class="transition duration-200 ease-editorial"
      leave-to-class="opacity-0"
    >
      <p
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto caption max-w-[42ch] border px-4 py-3 normal-case tracking-normal"
        :class="
          toast.tone === 'error'
            ? 'border-fail bg-paper text-fail'
            : 'border-ink bg-ink text-paper'
        "
        @click="dismiss(toast.id)"
      >
        {{ toast.message }}
      </p>
    </TransitionGroup>
  </div>
</template>
