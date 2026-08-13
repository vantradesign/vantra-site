<script setup lang="ts">
import { tools } from '~/data/tools'
import { itemListNode } from '~/utils/schema'
import { absoluteUrl } from '~/utils/site'

/**
 * `CollectionPage` plus an `ItemList`, because that is what this page is. The
 * list mirrors the visible rail below, in the same order, so the markup and the
 * rendered index cannot disagree about what the set contains.
 */
usePageSeo({
  title: 'Tools',
  description:
    'Eleven free browser tools: WCAG contrast, type and spacing scales, CSS clamp(), grid and flex, easing curves, unit conversion. Nothing leaves the browser.',
  pageType: 'CollectionPage',
  breadcrumb: [{ name: 'Tools', path: '/tools' }],
  schema: [
    itemListNode(
      absoluteUrl('/tools'),
      tools.map((tool) => ({
        name: tool.name,
        path: `/tools/${tool.slug}`,
        description: tool.summary,
      })),
    ),
  ],
})

const root = ref<HTMLElement | null>(null)
useScrollReveal(root)
</script>

<template>
  <div>
    <section class="gutter pt-16 md:pt-24">
      <p class="caption">Tools</p>
      <h1 class="mt-8 font-display text-cover max-w-[24ch] text-balance">
        Ten small instruments for the decisions you make every day.
      </h1>

      <div class="mt-12 md:grid md:grid-cols-12 md:gap-x-8">
        <p class="md:col-span-6 md:col-start-5 text-lead measure text-ink-muted">
          Contrast ratios, type scales, easing curves. The unglamorous arithmetic behind a design
          system, done properly and done in the browser. Nothing is uploaded, nothing is stored, and
          every result is one click from your clipboard.
        </p>
      </div>
    </section>

    <section ref="root" aria-labelledby="index-heading" class="mt-section">
      <h2 id="index-heading" class="gutter caption">The set</h2>

      <ul class="gutter mt-8 border-t border-ink">
        <li v-for="tool in tools" :key="tool.slug" class="border-b border-rule">
          <NuxtLink
            :to="`/tools/${tool.slug}`"
            class="group grid gap-y-2 py-8 md:grid-cols-12 md:items-baseline md:gap-x-8"
          >
            <span class="caption text-ink-faint tabular-nums md:col-span-1">{{ tool.index }}</span>

            <span class="md:col-span-5">
              <span
                class="font-display text-title underline decoration-transparent decoration-1 underline-offset-[0.2em] transition-[text-decoration-color] duration-300 ease-editorial group-hover:decoration-ink"
              >
                {{ tool.name }}
              </span>
            </span>

            <span class="md:col-span-4 measure text-ink-muted">{{ tool.summary }}</span>

            <span class="caption md:col-span-2 md:text-right">{{ tool.discipline }}</span>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <section class="gutter mt-section">
      <div class="md:grid md:grid-cols-12">
        <div class="md:col-span-8 md:col-start-5">
          <p class="font-display text-display text-balance measure-tight">
            Everything here runs on your machine, including the parts that look like a service.
          </p>
          <p class="mt-8">
            <AppLink to="/about" accent="blue">Why that matters</AppLink>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
