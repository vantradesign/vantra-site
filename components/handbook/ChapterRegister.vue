<script setup lang="ts">
import { chapters, chapterIds } from '~/data/handbook'

const props = defineProps<{
  /** Id of the element the register hides behind. It appears once that element has scrolled past. */
  revealAfter: string
}>()

const { active } = useActiveSection(chapterIds)

/* Hidden on the opening spread on purpose: the contents page is the navigation
   there, and two indexes on one screen is a docs habit, not an editorial one. */
const revealed = ref(false)

onMounted(() => {
  const sentinel = document.getElementById(props.revealAfter)

  if (!sentinel || !('IntersectionObserver' in window)) {
    revealed.value = true
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        revealed.value = entry.boundingClientRect.bottom < 0
      }
    },
    { threshold: 0 },
  )

  observer.observe(sentinel)
  onBeforeUnmount(() => observer.disconnect())
})
</script>

<template>
  <!-- One line, five entries, no nesting. Deliberately not a sidebar: it reads
       as a running head on a magazine spread. -->
  <nav
    aria-label="Chapters"
    class="fixed inset-x-0 top-0 z-40 border-b border-rule bg-paper/92 backdrop-blur-sm transition-[opacity,transform] duration-500 ease-editorial"
    :class="revealed ? 'opacity-100 translate-y-0' : 'pointer-events-none -translate-y-full opacity-0'"
    :aria-hidden="!revealed"
    :inert="!revealed"
  >
    <div class="gutter">
      <ul class="-mx-1 flex snap-x items-baseline gap-6 overflow-x-auto px-1 py-4 md:gap-10">
        <li class="caption hidden shrink-0 pr-2 text-ink-faint lg:block">Chapters</li>

        <li v-for="chapter in chapters" :key="chapter.id" class="shrink-0 snap-start">
          <a
            :href="`#${chapter.id}`"
            class="caption flex items-baseline gap-2 whitespace-nowrap underline decoration-1 underline-offset-[0.45em] transition-colors duration-300 ease-editorial hover:text-ink"
            :class="
              active === chapter.id
                ? 'text-blue decoration-blue'
                : 'decoration-transparent hover:decoration-ink/40'
            "
            :aria-current="active === chapter.id ? 'true' : undefined"
          >
            <span class="tabular-nums text-ink-faint">{{ chapter.index }}</span>
            <span>{{ chapter.title }}</span>
          </a>
        </li>
      </ul>
    </div>
  </nav>
</template>
