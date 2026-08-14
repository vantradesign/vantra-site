<script setup lang="ts">
import { products } from '~/data/products'
import { tools } from '~/data/tools'
import type { Product } from '~/types/product'

interface NavLink {
  label: string
  to: string
}

interface NavGroup {
  heading: string
  links: NavLink[]
}

interface NavItem {
  label: string
  to: string
  children?: NavGroup[]
}

const toolsByDiscipline: Record<string, NavLink[]> = {}
const disciplineOrder = ['Colour', 'Type', 'Layout', 'Motion', 'Units']

for (const tool of tools) {
  ;(toolsByDiscipline[tool.discipline] ??= []).push({
    label: tool.name,
    to: `/tools/${tool.slug}`,
  })
}

const STATUS_LABEL: Record<Product['status'], string> = {
  available: 'Available',
  'in-development': 'In development',
  planned: 'Planned',
}

const nav: NavItem[] = [
  {
    label: 'Work',
    to: '/work',
    children: [
      {
        heading: 'Products',
        links: products.map((p) => ({
          label: p.name,
          to: `/work/${p.slug}`,
        })),
      },
    ],
  },
  {
    label: 'Tools',
    to: '/tools',
    children: disciplineOrder
      .filter((d) => d in toolsByDiscipline)
      .map((d) => ({
        heading: d,
        links: toolsByDiscipline[d],
      })),
  },
  { label: 'How it works', to: '/how-it-works' },
  { label: 'Journal', to: '/journal' },
  { label: 'About', to: '/about' },
]

const openDropdown = ref<string | null>(null)
let closeTimer: ReturnType<typeof setTimeout> | null = null

function show(key: string) {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
  openDropdown.value = key
}

function scheduleClose() {
  closeTimer = setTimeout(() => {
    openDropdown.value = null
  }, 120)
}

function close() {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
  openDropdown.value = null
}

const route = useRoute()
watch(() => route.fullPath, close)
</script>

<template>
  <header class="sticky top-0 z-40 bg-paper border-b border-rule">
    <div class="gutter flex items-end justify-between py-2">
      <NuxtLink to="/" class="block" aria-label="Vantra — home">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 358.01 89.33" class="h-10" fill="currentColor" aria-hidden="true">
          <path d="M0,23.55h5.06l21.99,60.72,21.34-60.72h4.78l-23.27,65.78h-6.07L0,23.55Z"/>
          <path d="M76.37,23.55h6.81l23.64,65.78h-5.15l-7.27-20.15h-29.62l-7.18,20.15h-4.88l23.64-65.78ZM66.25,65.04h26.68l-13.34-37.26-13.34,37.26Z"/>
          <path d="M117.62,23.55h6.99l36.8,58.69V23.55h4.88v65.78h-6.07l-37.63-60.07v60.07h-4.97V23.55Z"/>
          <path d="M197.39,27.78h-20.42v-4.23h45.91v4.23h-20.42v61.54h-5.06V27.78Z"/>
          <path d="M233.5,23.55h18.03c12.79,0,22.35,4.97,22.35,17.66v.37c0,10.95-7.18,16.01-17.02,17.39l20.88,30.36h-5.7l-20.61-29.99h-12.79v29.99h-5.15V23.55ZM251.81,55.2c10.58,0,16.93-4.05,16.93-13.62v-.37c0-10.12-6.71-13.43-16.93-13.43h-13.16v27.42h13.16Z"/>
          <path d="M309.76,23.55h6.81l23.64,65.78h-5.15l-7.27-20.15h-29.62l-7.18,20.15h-4.88l23.64-65.78ZM299.64,65.04h26.68l-13.34-37.26-13.34,37.26Z"/>
          <polygon points="358.01 14.97 344.8 28.18 343.92 14.09 329.83 13.21 343.04 0 357.13 .88 358.01 14.97" fill="#021f94"/>
        </svg>
      </NuxtLink>

      <nav aria-label="Primary">
        <ul class="flex items-baseline gap-6 sm:gap-10">
          <li
            v-for="item in nav"
            :key="item.to"
            @mouseenter="item.children && show(item.to)"
            @mouseleave="item.children && scheduleClose()"
          >
            <NuxtLink
              :to="item.to"
              class="caption transition-colors duration-300 ease-editorial hover:text-ink"
              active-class="text-ink"
              :aria-expanded="item.children ? openDropdown === item.to : undefined"
              @focus="item.children && show(item.to)"
              @keydown.escape="close()"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Sub-navigation panels -->
    <Transition name="nav-dropdown">
      <div
        v-if="openDropdown"
        class="absolute inset-x-0 top-full border-b border-rule bg-paper"
        @mouseenter="show(openDropdown!)"
        @mouseleave="scheduleClose()"
        @keydown.escape="close()"
      >
        <div class="gutter py-8 md:py-10">
          <!-- Work panel -->
          <div
            v-if="openDropdown === '/work'"
            class="md:flex md:divide-x md:divide-rule"
          >
            <div class="md:flex-1 md:pr-8">
              <ul class="space-y-3">
                <li v-for="product in products" :key="product.slug">
                  <NuxtLink
                    :to="`/work/${product.slug}`"
                    class="group flex items-baseline justify-between gap-4"
                    @click="close()"
                  >
                    <span class="text-ink group-hover:text-blue transition-colors duration-300 ease-editorial">
                      {{ product.name }}
                    </span>
                    <span class="text-[0.8125rem] text-ink-faint whitespace-nowrap">
                      {{ STATUS_LABEL[product.status] }}
                    </span>
                  </NuxtLink>
                </li>
              </ul>
            </div>

            <div class="hidden md:block md:w-80 md:pl-8">
              <NuxtLink
                :to="`/work/${products[0].slug}`"
                class="group block"
                @click="close()"
              >
                <div class="relative aspect-[16/10] overflow-hidden">
                  <MoodImage :image="products[0].mood" sizes="320px" />
                </div>
                <p class="mt-4 font-display text-lead leading-snug text-balance group-hover:text-blue transition-colors duration-300 ease-editorial">
                  {{ products[0].coverLine }}
                </p>
                <p class="mt-2 text-[0.8125rem] text-ink-faint">
                  {{ products[0].summary }}
                </p>
              </NuxtLink>
            </div>
          </div>

          <!-- Tools panel -->
          <div
            v-if="openDropdown === '/tools'"
            class="flex flex-col gap-6 md:flex-row md:gap-0 md:divide-x md:divide-rule"
          >
            <div
              v-for="(d, i) in disciplineOrder"
              :key="d"
              :class="[
                'md:flex-1',
                i === 0
                  ? 'md:pr-5'
                  : i === disciplineOrder.length - 1
                    ? 'md:pl-5'
                    : 'md:px-5',
              ]"
            >
              <p class="caption mb-4">{{ d }}</p>
              <ul class="space-y-2.5">
                <li v-for="link in toolsByDiscipline[d]" :key="link.to">
                  <NuxtLink
                    :to="link.to"
                    class="block text-ink-muted hover:text-ink transition-colors duration-300 ease-editorial"
                    @click="close()"
                  >
                    {{ link.label }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.nav-dropdown-enter-active,
.nav-dropdown-leave-active {
  transition:
    opacity 300ms var(--ease-editorial),
    transform 300ms var(--ease-editorial);
}

.nav-dropdown-enter-from,
.nav-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
