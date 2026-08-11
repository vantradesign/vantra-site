<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const isNotFound = computed(() => props.error?.statusCode === 404)
</script>

<template>
  <div class="min-h-screen bg-paper text-ink flex flex-col">
    <SiteHeader />

    <main class="flex-1 gutter pt-24">
      <p class="caption">{{ error?.statusCode }}</p>
      <h1 class="mt-8 font-display text-cover max-w-[20ch] text-balance">
        {{ isNotFound ? 'Nothing filed under that name.' : 'Something broke on our side.' }}
      </h1>
      <p class="mt-10">
        <AppLink to="/" accent="blue">Back to the opening spread</AppLink>
      </p>
    </main>

    <SiteFooter />
  </div>
</template>
