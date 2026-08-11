<script setup lang="ts">
const nav = [
  { label: 'Work', to: '/work' },
  { label: 'Tools', to: '/tools' },
  { label: 'Journal', to: '/journal' },
  { label: 'About', to: '/about' },
]
</script>

<template>
  <header class="gutter border-b border-rule">
    <div class="flex items-baseline justify-between py-6">
      <NuxtLink to="/" class="font-display text-[1.375rem] tracking-[-0.02em] leading-none">
        Vantra
      </NuxtLink>

      <nav aria-label="Primary">
        <ul class="flex items-baseline gap-6 sm:gap-10">
          <li v-for="item in nav" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="caption transition-colors duration-300 ease-editorial hover:text-ink"
              active-class="text-ink"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>
