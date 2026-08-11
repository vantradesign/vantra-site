<script setup lang="ts">
defineProps<{
  kicker: string
  /** Magazine cover line. Sentence case, ends in a full stop. */
  coverLine: string
  /** Editorial standfirst. Why the thing matters, not how the tool works. */
  lead: string
}>()
</script>

<template>
  <section class="gutter pt-16 md:pt-24">
    <p class="caption">{{ kicker }}</p>

    <h1 class="mt-8 font-display text-display max-w-[26ch] text-balance">
      {{ coverLine }}
    </h1>

    <div class="mt-10 md:grid md:grid-cols-12 md:gap-x-8">
      <p class="md:col-span-6 md:col-start-5 text-lead measure text-ink-muted">
        {{ lead }}
      </p>
    </div>

    <slot />
  </section>
</template>
