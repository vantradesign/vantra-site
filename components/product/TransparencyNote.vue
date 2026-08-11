<script setup lang="ts">
import type { Product } from '~/types/product'

defineProps<{ transparency: Product['transparency'] }>()

const root = ref<HTMLElement | null>(null)
useScrollReveal(root)
</script>

<template>
  <section ref="root" class="mt-section bg-ink text-paper py-20 md:py-28">
    <div class="gutter">
      <h2 class="caption text-cyan-soft/70">What it does and does not do</h2>

      <div class="mt-12 grid gap-14 md:grid-cols-2 md:gap-x-8">
        <div v-if="transparency.automatic.length">
          <h3 class="font-display text-title">Detected automatically</h3>
          <ul class="mt-6 space-y-4">
            <li
              v-for="item in transparency.automatic"
              :key="item"
              class="border-t border-paper/15 pt-4 measure text-paper/75"
            >
              {{ item }}
            </li>
          </ul>
        </div>

        <div v-if="transparency.manual.length">
          <h3 class="font-display text-title">Needs a human</h3>
          <ul class="mt-6 space-y-4">
            <li
              v-for="item in transparency.manual"
              :key="item"
              class="border-t border-paper/15 pt-4 measure text-paper/75"
            >
              {{ item }}
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-16 md:grid md:grid-cols-12">
        <p class="md:col-span-8 md:col-start-5 font-display text-title text-balance">
          100% local.
        </p>
        <p class="md:col-span-8 md:col-start-5 mt-5 measure text-paper/75">
          {{ transparency.locality }}
        </p>
      </div>
    </div>
  </section>
</template>
