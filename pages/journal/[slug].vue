<script setup lang="ts">
import { articleNode } from '~/utils/schema'
import { absoluteUrl } from '~/utils/site'

const route = useRoute()
const slug = route.params.slug as string

const { data: article } = await useAsyncData(`journal-${slug}`, () =>
  queryCollection('journal').path(`/journal/${slug}`).first(),
)

if (!article.value) {
  throw createError({
    statusCode: 404,
    statusMessage: `No journal article for slug "${slug}"`,
    fatal: true,
  })
}

const path = `/journal/${slug}`

usePageSeo({
  title: article.value.title,
  description: article.value.description,
  breadcrumb: [
    { name: 'Journal', path: '/journal' },
    { name: article.value.title, path },
  ],
  schema: [
    articleNode({
      url: absoluteUrl(path),
      headline: article.value.title,
      description: article.value.description,
      datePublished: article.value.datePublished,
      dateModified: article.value.dateModified,
    }),
  ],
})

const formattedDate = computed(() => {
  if (!article.value) return ''
  return new Date(article.value.datePublished).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})
</script>

<template>
  <div v-if="article">
    <article class="gutter pt-16 md:pt-24 pb-16 md:pb-24">
      <header>
        <p class="caption">Journal</p>
        <h1 class="mt-8 font-display text-cover max-w-[22ch] text-balance">
          {{ article.title }}
        </h1>
        <p class="mt-6 text-ink-muted">
          {{ article.author.name }}, {{ article.author.role }}
          · {{ formattedDate }}
        </p>
      </header>

      <!-- Lede / quick-answer block -->
      <div class="mt-12 md:grid md:grid-cols-12 md:gap-x-8">
        <div class="md:col-span-7 md:col-start-5">
          <p
            v-for="(paragraph, i) in article.lede"
            :key="`lede-${i}`"
            class="text-lead measure text-ink-muted"
            :class="{ 'mt-6': i > 0 }"
            v-html="paragraph"
          />
        </div>
      </div>

      <!-- Body content rendered from markdown -->
      <div class="mt-section md:grid md:grid-cols-12 md:gap-x-8">
        <div class="md:col-span-7 md:col-start-5 journal-body">
          <ContentRenderer :value="article" />
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
.journal-body :deep(h2) {
  font-family: var(--font-display);
  font-size: var(--text-display);
  line-height: 1.15;
  margin-top: clamp(6rem, 13vw, 12.5rem);
}

.journal-body :deep(h2:first-child) {
  margin-top: 0;
}

.journal-body :deep(p) {
  margin-top: 1.5rem;
  max-width: var(--measure, 65ch);
}

.journal-body :deep(a) {
  text-decoration: underline;
  text-underline-offset: 0.15em;
}

.journal-body :deep(a:hover) {
  opacity: 0.7;
}

.journal-body :deep(code) {
  font-size: 0.9em;
  background: color-mix(in oklch, var(--color-ink) 8%, transparent);
  padding: 0.15em 0.35em;
  border-radius: 0.25rem;
}

.journal-body :deep(table) {
  width: 100%;
  font-size: 0.875rem;
  margin-top: 2rem;
}

.journal-body :deep(th) {
  border-bottom: 1px solid var(--color-rule, currentColor);
  padding: 0.5rem 0.75rem;
  text-align: left;
  font-weight: 600;
}

.journal-body :deep(td) {
  border-bottom: 1px solid color-mix(in oklch, var(--color-rule, currentColor) 50%, transparent);
  padding: 0.5rem 0.75rem;
}
</style>
