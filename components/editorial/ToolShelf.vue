<script setup lang="ts">
import { tools } from '~/data/tools'

/**
 * The utilities on the home page, set out the way a shop sets out goods: one
 * tile each, the same frame every time, priced in the only currency they have —
 * the discipline they belong to.
 *
 * The tiles are drawings, not screenshots (see ToolSpecimen), and they are
 * aria-hidden. Each card is one link with the tool's name inside it, so the
 * whole grid reads as a plain list of ten links to a screen reader.
 */
const root = ref<HTMLElement | null>(null)
useScrollReveal(root)

/** Alternates the accent so the shelf does not read as one colour block. */
function accentFor(i: number): 'blue' | 'cyan' {
  return i % 3 === 1 ? 'blue' : 'cyan'
}
</script>

<template>
  <section ref="root" aria-labelledby="shelf-heading" class="mt-section">
    <div class="gutter">
      <div class="md:grid md:grid-cols-12 md:items-end md:gap-x-8">
        <div class="md:col-span-7">
          <h2 id="shelf-heading" class="caption">Tools</h2>
          <p class="mt-6 font-display text-display text-balance measure-tight">
            Ten small instruments, off the shelf.
          </p>
        </div>

        <p class="mt-6 measure text-ink-muted md:col-span-4 md:col-start-9 md:mt-0">
          The arithmetic behind a design system — contrast, scales, curves, units. Nothing to
          install, nothing uploaded, every result one click from your clipboard.
        </p>
      </div>

      <ul class="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:mt-16 lg:grid-cols-5">
        <li v-for="(tool, i) in tools" :key="tool.slug">
          <NuxtLink :to="`/tools/${tool.slug}`" class="group block">
            <div
              class="relative aspect-4/5 overflow-hidden bg-ink/[0.04] transition-colors duration-300 ease-editorial group-hover:bg-ink/[0.08]"
            >
              <div class="absolute inset-0 p-5">
                <ToolSpecimen :specimen="tool.specimen" :accent="accentFor(i)" />
              </div>

              <p class="caption absolute left-4 top-4 tabular-nums text-ink-faint">
                {{ tool.index }}
              </p>
            </div>

            <p class="mt-4">
              <span
                class="font-display text-lead underline decoration-transparent decoration-1 underline-offset-[0.2em] transition-[text-decoration-color] duration-300 ease-editorial group-hover:decoration-ink"
              >
                {{ tool.name }}
              </span>
            </p>

            <p class="caption mt-1">{{ tool.discipline }}</p>
          </NuxtLink>
        </li>
      </ul>

      <p class="mt-12">
        <AppLink to="/tools" accent="blue">All ten tools</AppLink>
      </p>
    </div>
  </section>
</template>
