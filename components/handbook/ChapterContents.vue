<script setup lang="ts">
import { chapters } from '~/data/handbook'

const root = ref<HTMLElement | null>(null)
useScrollReveal(root)
</script>

<template>
  <!-- A magazine contents page: index, title, one line of why. Not a tree. -->
  <nav ref="root" aria-labelledby="contents-heading" class="gutter mt-section">
    <h2 id="contents-heading" class="caption">Contents</h2>

    <ol class="mt-8 border-t border-ink">
      <li v-for="chapter in chapters" :key="chapter.id" class="border-b border-rule">
        <a
          :href="`#${chapter.id}`"
          class="group grid gap-y-2 py-7 md:grid-cols-12 md:items-baseline md:gap-x-8"
        >
          <span class="caption tabular-nums text-ink-faint md:col-span-1">{{ chapter.index }}</span>

          <span class="md:col-span-5">
            <span
              class="font-display text-title underline decoration-transparent decoration-1 underline-offset-[0.2em] transition-[text-decoration-color] duration-300 ease-editorial group-hover:decoration-ink"
            >
              {{ chapter.title }}
            </span>
          </span>

          <span class="measure text-ink-muted md:col-span-6">{{ chapter.teaser }}</span>
        </a>
      </li>
    </ol>
  </nav>
</template>
