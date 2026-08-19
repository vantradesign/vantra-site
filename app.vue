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
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
