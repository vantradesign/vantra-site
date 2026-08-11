<script setup lang="ts">
import { findProduct } from '~/data/products'

const route = useRoute()
const slug = computed(() => String(route.params.slug))

/**
 * Data is local today, but it is read through useAsyncData so that swapping the
 * source for a Supabase query or a Nuxt Content collection later is a change
 * inside this handler only — and works identically under SSR.
 */
const { data: product } = await useAsyncData(
  () => `product:${slug.value}`,
  async () => findProduct(slug.value) ?? null,
  { watch: [slug] },
)

if (!product.value) {
  throw createError({ statusCode: 404, statusMessage: 'No such work entry', fatal: true })
}

useSeoMeta({
  title: () => product.value?.name ?? 'Work',
  description: () => product.value?.summary ?? '',
})

const supportingMedia = computed(() => product.value?.media.slice(1) ?? [])
</script>

<template>
  <div v-if="product">
    <ProductHero :product="product" />

    <section class="gutter mt-section">
      <div class="md:grid md:grid-cols-12">
        <h2 class="caption md:col-span-3">The problem</h2>
        <p class="md:col-span-8 md:col-start-5 mt-6 md:mt-0 text-lead measure">
          {{ product.problem }}
        </p>
      </div>
    </section>

    <section v-if="supportingMedia.length" class="mt-section space-y-24 md:space-y-32">
      <ProductMediaBlock
        v-for="media in supportingMedia"
        :key="media.src"
        :media="media"
        :full="media === supportingMedia[0]"
      />
    </section>

    <ProductDetailBlock kicker="How it works" :entries="product.howItWorks" />

    <TransparencyNote :transparency="product.transparency" />

    <section class="gutter mt-section">
      <div class="md:grid md:grid-cols-12 md:gap-x-8">
        <div class="md:col-span-5">
          <h2 class="font-display text-title">Get it</h2>
          <ul class="mt-6 space-y-3">
            <li v-for="link in product.links" :key="link.href">
              <AppLink :to="link.href" accent="blue">{{ link.label }}</AppLink>
            </li>
          </ul>
        </div>

        <dl class="md:col-span-6 md:col-start-7 mt-14 md:mt-0 space-y-6">
          <div class="border-t border-rule pt-4">
            <dt class="caption">License</dt>
            <dd class="mt-2">{{ product.license }}</dd>
          </div>
          <div class="border-t border-rule pt-4">
            <dt class="caption">Status &amp; roadmap</dt>
            <dd class="mt-2 measure text-ink-muted">{{ product.roadmap }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="gutter mt-section">
      <AppLink to="/work">All work</AppLink>
    </section>
  </div>
</template>
