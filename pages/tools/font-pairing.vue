<script setup lang="ts">
import '~/assets/css/tool-fonts.css'
import { FONT_MOODS, FONT_PAIRINGS } from '~/utils/tools/fonts'
import type { FontPairing } from '~/utils/tools/fonts'
import type { Chip } from '~/types/tools'

useToolPageSeo({
  slug: 'font-pairing',
  title: 'Font Pairing Studio',
  description:
    'Curated typeface combinations previewed as real editorial spreads, filtered by mood, with copy-ready CSS. Fonts are self-hosted — no third-party requests.',
})

const mood = ref<string>('all')

const chips: Chip[] = [
  { value: 'all', label: 'All pairings' },
  ...FONT_MOODS.map((entry) => ({ value: entry, label: entry })),
]

const visible = computed(() =>
  mood.value === 'all'
    ? FONT_PAIRINGS
    : FONT_PAIRINGS.filter((pairing) => pairing.mood === mood.value),
)

function stack(face: FontPairing['heading']) {
  return `'${face.family}', ${face.fallback}`
}

const activePairing = ref<FontPairing | null>(null)
const panelOpen = computed(() => activePairing.value !== null)
const panelRef = ref<{ triggerRef: HTMLElement | null } | null>(null)
const triggerRefs = ref<Map<string, HTMLElement>>(new Map())

function openPanel(pairing: FontPairing, event: Event) {
  activePairing.value = pairing
  const button = event.currentTarget as HTMLElement
  triggerRefs.value.set(pairing.id, button)
  nextTick(() => {
    if (panelRef.value) {
      panelRef.value.triggerRef = button
    }
  })
}

function closePanel() {
  const id = activePairing.value?.id
  activePairing.value = null
  if (id) {
    nextTick(() => {
      triggerRefs.value.get(id)?.focus()
    })
  }
}
</script>

<template>
  <div>
    <ToolIntro
      kicker="Tools — 03"
      cover-line="Two typefaces, one argument."
      lead="A pairing is not a decoration: it is the tone of voice before a single word is read. These twelve combinations are curated, not generated — each one previewed at the size you would actually set it, as a headline with a paragraph underneath, because that is the only test that matters."
    />

    <section aria-labelledby="pairings-heading" class="gutter mt-20 md:mt-28">
      <h2 id="pairings-heading" class="caption">Pairings</h2>

      <div class="mt-6">
        <ToolChipRail v-model="mood" label="Filter by mood" :chips="chips" />
      </div>

      <p class="caption mt-4 normal-case tracking-normal text-ink-muted" aria-live="polite">
        {{ visible.length }} {{ visible.length === 1 ? 'pairing' : 'pairings' }} shown.
      </p>

      <ul class="mt-12 grid gap-x-8 gap-y-16 lg:grid-cols-3">
        <li
          v-for="pairing in visible"
          :key="pairing.id"
          class="flex flex-col border-t border-ink pt-6"
        >
          <div class="flex items-baseline justify-between gap-4">
            <p class="caption">{{ pairing.mood }}</p>
            <p class="caption normal-case tracking-normal text-ink-muted">
              {{ pairing.heading.family }} + {{ pairing.body.family }}
            </p>
          </div>

          <!-- The spread is the product here: real headline size, real measure,
               real paragraph. Not a specimen strip. -->
          <div class="mt-8 flex-1">
            <p
              class="text-[clamp(1.75rem,2.4vw,2.25rem)] leading-[1.1] tracking-[-0.015em]"
              :style="{ fontFamily: stack(pairing.heading), fontWeight: pairing.heading.weight }"
            >
              {{ pairing.sampleHeading }}
            </p>

            <p
              class="mt-6 text-[1.0625rem] leading-[1.65] text-ink-muted"
              :style="{ fontFamily: stack(pairing.body), fontWeight: pairing.body.weight }"
            >
              {{ pairing.sampleBody }}
            </p>
          </div>

          <p class="mt-8 text-[0.9375rem] leading-snug text-ink-muted">{{ pairing.note }}</p>

          <div class="mt-6">
            <button
              type="button"
              class="caption inline-flex min-h-11 shrink-0 items-center justify-center gap-2 border border-ink bg-ink px-4 py-2 normal-case tracking-normal text-paper transition-colors duration-200 ease-editorial hover:border-blue hover:bg-blue"
              :aria-label="`Use ${pairing.heading.family} with ${pairing.body.family}`"
              @click="openPanel(pairing, $event)"
            >
              Use this pairing
            </button>
          </div>
        </li>
      </ul>
    </section>

    <section aria-labelledby="loading-heading" class="gutter mt-section">
      <div class="md:grid md:grid-cols-12 md:gap-x-8">
        <h2 id="loading-heading" class="caption md:col-span-3">On loading</h2>
        <p class="mt-4 measure text-ink-muted md:col-span-6 md:col-start-5 md:mt-0">
          Every preview here is served from this domain. Click "Use this pairing" for
          copy-ready code — choose between Google Fonts CDN and self-hosted files, with
          framework-specific setup for Nuxt, Next.js, Vite, SvelteKit, Astro, or plain HTML.
          Variable font and italic options are available where the typeface supports them.
        </p>
      </div>
    </section>

    <ToolReference slug="font-pairing" />

    <ToolFooterNav slug="font-pairing" />

    <FontPairingPanel
      v-if="activePairing"
      ref="panelRef"
      :pairing="activePairing"
      :open="panelOpen"
      @close="closePanel"
    />
  </div>
</template>
