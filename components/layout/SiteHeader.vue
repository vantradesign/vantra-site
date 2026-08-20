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

for (const tool of tools) {
  ;(toolsByDiscipline[tool.discipline] ??= []).push({
    label: tool.name,
    to: `/tools/${tool.slug}`,
  })
}

/**
 * Four balanced columns for the tools mega-menu. Related small disciplines
 * share a column so nothing gets a lonely single-item strip.
 */
const toolColumns: NavGroup[][] = [
  [{ heading: 'Colour', links: toolsByDiscipline['Colour'] ?? [] }],
  [{ heading: 'Layout', links: toolsByDiscipline['Layout'] ?? [] }],
  [
    { heading: 'Type', links: toolsByDiscipline['Type'] ?? [] },
    { heading: 'Governance', links: toolsByDiscipline['Governance'] ?? [] },
    { heading: 'Assets', links: toolsByDiscipline['Assets'] ?? [] },
  ],
  [
    { heading: 'Units', links: toolsByDiscipline['Units'] ?? [] },
    { heading: 'Motion', links: toolsByDiscipline['Motion'] ?? [] },
    { heading: 'Content', links: toolsByDiscipline['Content'] ?? [] },
    { heading: 'Accessibility', links: toolsByDiscipline['Accessibility'] ?? [] },
  ],
]

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
    children: toolColumns.flat(),
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

/* ── Mobile menu ── */
const mobileOpen = ref(false)
const mobileExpanded = ref<string | null>(null)

function toggleMobile() {
  mobileOpen.value = !mobileOpen.value
  if (!mobileOpen.value) mobileExpanded.value = null
}

function closeMobile() {
  mobileOpen.value = false
  mobileExpanded.value = null
}

function toggleSection(key: string) {
  mobileExpanded.value = mobileExpanded.value === key ? null : key
}

const route = useRoute()
watch(() => route.fullPath, () => {
  close()
  closeMobile()
})
</script>

<template>
  <header class="sticky top-0 z-40 bg-paper border-b border-rule">
    <div class="gutter flex items-end justify-between py-2">
      <NuxtLink to="/" class="block" aria-label="Vantra — home">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 149.61 39.73" class="h-10" fill="currentColor" aria-hidden="true">
          <path d="M0,12.65h2.08l9.05,24.99,8.79-24.99h1.97l-9.58,27.08h-2.5L0,12.65Z"/>
          <path d="M31.44,12.65h2.8l9.73,27.08h-2.12l-2.99-8.29h-12.19l-2.95,8.29h-2.01l9.73-27.08ZM27.27,29.73h10.98l-5.49-15.34-5.49,15.34Z"/>
          <path d="M48.42,12.65h2.88l15.15,24.16V12.65h2.01v27.08h-2.5l-15.49-24.73v24.73h-2.04V12.65Z"/>
          <path d="M81.26,14.4h-8.41v-1.74h18.9v1.74h-8.41v25.34h-2.08V14.4Z"/>
          <path d="M96.12,12.65h7.42c5.26,0,9.2,2.04,9.2,7.27v.15c0,4.51-2.95,6.59-7.01,7.16l8.6,12.5h-2.35l-8.48-12.35h-5.26v12.35h-2.12V12.65ZM103.66,25.68c4.35,0,6.97-1.67,6.97-5.6v-.15c0-4.17-2.76-5.53-6.97-5.53h-5.42v11.29h5.42Z"/>
          <path d="M127.51,12.65h2.8l9.73,27.08h-2.12l-2.99-8.29h-12.19l-2.95,8.29h-2.01l9.73-27.08ZM123.35,29.73h10.98l-5.49-15.34-5.49,15.34Z"/>
          <polygon points="149.61 8.05 142.52 15.14 142.04 7.57 134.47 7.1 141.57 0 149.14 .47 149.61 8.05" fill="#021f94"/>
        </svg>
      </NuxtLink>

      <!-- Desktop nav -->
      <nav aria-label="Primary" class="hidden md:block">
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

      <!-- Mobile hamburger -->
      <button
        class="md:hidden flex items-center justify-center w-11 h-11"
        aria-label="Open menu"
        @click="toggleMobile"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
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
        <div>
          <!-- Work panel -->
          <div
            v-if="openDropdown === '/work'"
            class="gutter py-8 md:flex md:py-10 md:divide-x md:divide-rule"
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
            class="border-t border-rule"
          >
            <div class="grid md:grid-cols-4">
              <div
                v-for="(column, ci) in toolColumns"
                :key="ci"
                class="divide-y divide-rule border-b border-rule md:border-b-0"
                :class="ci > 0 ? 'md:border-l md:border-rule' : ''"
              >
                <div v-for="(group, gi) in column" :key="group.heading" class="px-[calc(var(--spacing-gutter)*0.65)]" :class="[gi === 0 ? 'pt-6 md:pt-8' : 'pt-5', gi === column.length - 1 ? 'pb-6 md:pb-8' : 'pb-5']">
                  <p class="caption mb-3">{{ group.heading }}</p>
                  <ul class="space-y-2">
                    <li v-for="link in group.links" :key="link.to">
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
        </div>
      </div>
    </Transition>

    <!-- Mobile fullscreen overlay -->
    <Transition name="mobile-menu">
      <div
        v-if="mobileOpen"
        class="fixed inset-0 z-50 bg-paper md:hidden"
      >
        <div class="gutter flex items-end justify-between py-2 border-b border-rule">
          <NuxtLink to="/" class="block" aria-label="Vantra — home" @click="closeMobile">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 149.61 39.73" class="h-10" fill="currentColor" aria-hidden="true">
              <path d="M0,12.65h2.08l9.05,24.99,8.79-24.99h1.97l-9.58,27.08h-2.5L0,12.65Z"/>
              <path d="M31.44,12.65h2.8l9.73,27.08h-2.12l-2.99-8.29h-12.19l-2.95,8.29h-2.01l9.73-27.08ZM27.27,29.73h10.98l-5.49-15.34-5.49,15.34Z"/>
              <path d="M48.42,12.65h2.88l15.15,24.16V12.65h2.01v27.08h-2.5l-15.49-24.73v24.73h-2.04V12.65Z"/>
              <path d="M81.26,14.4h-8.41v-1.74h18.9v1.74h-8.41v25.34h-2.08V14.4Z"/>
              <path d="M96.12,12.65h7.42c5.26,0,9.2,2.04,9.2,7.27v.15c0,4.51-2.95,6.59-7.01,7.16l8.6,12.5h-2.35l-8.48-12.35h-5.26v12.35h-2.12V12.65ZM103.66,25.68c4.35,0,6.97-1.67,6.97-5.6v-.15c0-4.17-2.76-5.53-6.97-5.53h-5.42v11.29h5.42Z"/>
              <path d="M127.51,12.65h2.8l9.73,27.08h-2.12l-2.99-8.29h-12.19l-2.95,8.29h-2.01l9.73-27.08ZM123.35,29.73h10.98l-5.49-15.34-5.49,15.34Z"/>
              <polygon points="149.61 8.05 142.52 15.14 142.04 7.57 134.47 7.1 141.57 0 149.14 .47 149.61 8.05" fill="#021f94"/>
            </svg>
          </NuxtLink>

          <button
            class="flex items-center justify-center w-11 h-11"
            aria-label="Close menu"
            @click="closeMobile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" aria-hidden="true">
              <line x1="5" y1="5" x2="19" y2="19" />
              <line x1="19" y1="5" x2="5" y2="19" />
            </svg>
          </button>
        </div>

        <nav aria-label="Mobile" class="overflow-y-auto" style="height: calc(100vh - 3.5rem)">
          <ul class="divide-y divide-rule">
            <li v-for="item in nav" :key="item.to">
              <!-- Items with children: accordion -->
              <template v-if="item.children">
                <button
                  class="gutter w-full flex items-center justify-between py-5"
                  :aria-expanded="mobileExpanded === item.to"
                  @click="toggleSection(item.to)"
                >
                  <span class="font-display text-lead">{{ item.label }}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    class="w-5 h-5 text-ink-muted transition-transform duration-300 ease-editorial"
                    :class="mobileExpanded === item.to ? 'rotate-180' : ''"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="square"
                    aria-hidden="true"
                  >
                    <polyline points="6,9 12,15 18,9" />
                  </svg>
                </button>

                <div v-show="mobileExpanded === item.to" class="gutter pb-6">
                  <NuxtLink
                    :to="item.to"
                    class="caption block mb-4 text-ink hover:text-blue transition-colors duration-300 ease-editorial"
                    @click="closeMobile"
                  >
                    View all
                  </NuxtLink>
                  <div
                    v-for="group in item.children"
                    :key="group.heading"
                    class="mb-5 last:mb-0"
                  >
                    <p class="caption mb-2">{{ group.heading }}</p>
                    <ul class="space-y-2">
                      <li v-for="link in group.links" :key="link.to">
                        <NuxtLink
                          :to="link.to"
                          class="block text-ink-muted hover:text-ink transition-colors duration-300 ease-editorial"
                          @click="closeMobile"
                        >
                          {{ link.label }}
                        </NuxtLink>
                      </li>
                    </ul>
                  </div>
                </div>
              </template>

              <!-- Simple links -->
              <template v-else>
                <NuxtLink
                  :to="item.to"
                  class="gutter block py-5 font-display text-lead hover:text-blue transition-colors duration-300 ease-editorial"
                  @click="closeMobile"
                >
                  {{ item.label }}
                </NuxtLink>
              </template>
            </li>
          </ul>
        </nav>
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

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 300ms var(--ease-editorial);
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
}
</style>
