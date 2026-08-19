<script setup lang="ts">
import { SITE, formatTitle } from '~/utils/site'

// The rule now lives in utils/site.ts because `og:title` needs the same resolved
// string and unhead does not apply titleTemplate to Open Graph tags. Keeping two
// copies is how the tab title and the share card end up disagreeing.
useHead({
  titleTemplate: (title) => formatTitle(title ?? SITE.name),
})
</script>

<template>
  <div class="min-h-screen bg-paper text-ink flex flex-col">
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-ink focus:text-paper focus:px-4 focus:py-2"
    >
      Skip to content
    </a>

    <SiteHeader />

    <main id="main" aria-label="Content" class="flex-1">
      <NuxtPage />
    </main>

    <SiteFooter />

    <ToastHost />
  </div>
</template>
