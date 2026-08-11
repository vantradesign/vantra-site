<script setup lang="ts">
type Accent = 'ink' | 'blue' | 'cyan'

const props = withDefaults(defineProps<{ to: string; accent?: Accent }>(), {
  accent: 'ink',
})

const ACCENT_CLASS: Record<Accent, string> = {
  ink: 'decoration-ink/30 hover:decoration-ink',
  blue: 'text-blue decoration-blue/40 hover:decoration-blue',
  cyan: 'decoration-cyan hover:decoration-cyan',
}

const isExternal = computed(() => /^(https?:)?\/\/|^mailto:/.test(props.to))
const accentClass = computed(() => ACCENT_CLASS[props.accent])

const base =
  'underline underline-offset-[0.3em] decoration-1 transition-[text-decoration-color] duration-300 ease-editorial'
</script>

<template>
  <a
    v-if="isExternal"
    :href="to"
    target="_blank"
    rel="noopener noreferrer"
    :class="[base, accentClass]"
  >
    <slot />
    <span aria-hidden="true" class="ml-1 inline-block">&#8599;</span>
    <span class="sr-only">(opens in a new tab)</span>
  </a>

  <NuxtLink v-else :to="to" :class="[base, accentClass]">
    <slot />
  </NuxtLink>
</template>
