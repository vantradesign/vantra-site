<script setup lang="ts">
/**
 * The journal index. Previously `noindex` while the section was a stub.
 * Now that articles exist, the flag and the `EXCLUDED_FROM_SITEMAP` entry
 * in `data/routes.ts` are removed in this same commit.
 *
 * Design inspired by watchhouse.com/blogs/spotlight: large editorial heading,
 * featured-first card, then a two-column grid for the rest.
 */
usePageSeo({
  title: 'Journal',
  description:
    'Build notes, decisions and reasoning from the making of Vantra\u2019s design system tools.',
  breadcrumb: [{ name: 'Journal', path: '/journal' }],
  pageType: 'CollectionPage',
})

const { data: articles } = await useAsyncData('journal-list', () =>
  queryCollection('journal').order('datePublished', 'DESC').all(),
)

const featured = computed(() => articles.value?.[0] ?? null)
const rest = computed(() => articles.value?.slice(1) ?? [])

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <div>
    <!-- Hero -->
    <header class="gutter pt-20 md:pt-32 pb-16 md:pb-24">
      <h1 class="font-display text-cover">Journal.</h1>
      <p class="mt-4 text-lead text-ink-muted max-w-[38ch]">
        Build notes, decisions and reasoning from the making of Vantra's tools.
      </p>
    </header>

    <div v-if="articles?.length" class="gutter pb-24 md:pb-32">
      <!-- Featured article -->
      <NuxtLink
        v-if="featured"
        :to="featured.path"
        class="group block border border-rule p-10 md:p-12 hover:border-ink transition-[border-color] duration-300 ease-editorial"
      >
        <p class="caption">{{ formatDate(featured.datePublished) }}</p>
        <h2 class="mt-4 font-display text-display max-w-[20ch] text-balance group-hover:text-blue transition-colors duration-300 ease-editorial">
          {{ featured.title }}
        </h2>
        <p class="mt-4 text-lead text-ink-muted max-w-[52ch]">
          {{ featured.description }}
        </p>
        <p class="mt-6 caption text-blue">Read article&ensp;&rarr;</p>
      </NuxtLink>

      <!-- Grid -->
      <ul class="mt-12 md:mt-16 grid gap-6 md:grid-cols-2">
        <li v-for="article in rest" :key="article.path">
          <NuxtLink
            :to="article.path"
            class="group flex h-full flex-col border border-rule p-8 hover:border-ink transition-[border-color] duration-300 ease-editorial"
          >
            <p class="caption">{{ formatDate(article.datePublished) }}</p>
            <h2 class="mt-4 font-display text-title max-w-[20ch] text-balance group-hover:text-blue transition-colors duration-300 ease-editorial">
              {{ article.title }}
            </h2>
            <p class="mt-3 text-ink-muted measure-tight flex-1">
              {{ article.description }}
            </p>
            <p class="mt-6 caption text-blue">Read article&ensp;&rarr;</p>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

