<script setup lang="ts">
defineProps<{ paragraphs: string[]; kicker?: string }>()
</script>

<template>
  <div class="gutter mt-14">
    <div class="md:grid md:grid-cols-12 md:gap-x-8">
      <p v-if="kicker" class="caption md:col-span-2">{{ kicker }}</p>

      <div class="mt-6 space-y-6 md:col-span-6 md:col-start-4 md:mt-0">
        <p v-for="paragraph in paragraphs" :key="paragraph" class="measure">{{ paragraph }}</p>
        <slot />
      </div>
    </div>
  </div>
</template>
