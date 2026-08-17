<script setup lang="ts">
/**
 * Sticky progress rail showing one segment per category.
 *
 * Docks below the site header. The `top-14` value matches the site header
 * height (py-2 + h-10 + border ≈ 3.5rem = top-14).
 */
const props = defineProps<{ currentIndex: number }>()

const t = useMcT()
const m = useMcMessages()
const catalog = useMcCatalog()
const { answeredIn } = useMaturityAssessment()
</script>

<template>
  <nav
    :aria-label="m('progressLabel')"
    class="sticky top-14 z-30 flex h-12 border-b border-rule bg-paper"
  >
    <NuxtLink
      v-for="(category, index) in catalog.categories"
      :key="category.id"
      :to="`${MC_BASE}/check/${category.id}`"
      class="group relative flex flex-1 items-center justify-center overflow-hidden border-r border-rule transition-colors duration-200 ease-editorial last:border-r-0"
      :class="index === currentIndex ? 'bg-white' : 'hover:bg-white/50'"
      :aria-current="index === currentIndex ? 'step' : undefined"
    >
      <span class="relative z-10 text-caption normal-case tracking-normal">
        <span class="hidden sm:inline">{{ t(category.name) }}</span>
        <span class="sm:hidden">{{ index + 1 }}</span>
      </span>
      <span
        class="absolute inset-y-0 left-0 bg-blue/10 transition-[width] duration-300 ease-editorial"
        :style="{
          width: `${(answeredIn(category.id) / category.questions.length) * 100}%`,
        }"
      />
    </NuxtLink>
  </nav>
</template>
