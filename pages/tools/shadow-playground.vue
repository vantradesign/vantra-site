<script setup lang="ts">
import { SHADOW_PRESETS, shadowToCss } from '~/utils/tools/shadow'
import type { ShadowLayer } from '~/utils/tools/shadow'
import type { Chip } from '~/types/tools'

useSeoMeta({
  title: 'Radius & Shadow Playground',
  description:
    'Build layered box-shadow and border-radius values against a real content card, with keyboard-operable sliders and copy-ready CSS.',
})

let nextId = 0

function withIds(preset: (typeof SHADOW_PRESETS)[number]): ShadowLayer[] {
  return preset.layers.map((layer) => ({ ...layer, id: ++nextId }))
}

const radius = ref(SHADOW_PRESETS[0]!.radius)
const layers = ref<ShadowLayer[]>(withIds(SHADOW_PRESETS[0]!))
const openLayer = ref<number | null>(layers.value[0]?.id ?? null)

const chips: Chip[] = SHADOW_PRESETS.map((preset) => ({
  value: preset.value,
  label: preset.label,
}))

const preset = ref(SHADOW_PRESETS[0]!.value)

watch(preset, (value) => {
  const match = SHADOW_PRESETS.find((entry) => entry.value === value)
  if (!match) return
  radius.value = match.radius
  layers.value = withIds(match)
  openLayer.value = layers.value[0]?.id ?? null
})

const EXTRA_NAMES = ['Contact', 'Cast', 'Halo', 'Bloom']

function addLayer() {
  const name = EXTRA_NAMES[(layers.value.length - 2 + EXTRA_NAMES.length) % EXTRA_NAMES.length]!
  const layer: ShadowLayer = {
    id: ++nextId,
    name,
    x: 0,
    y: 4,
    blur: 12,
    spread: 0,
    color: '#001619',
    opacity: 10,
    inset: false,
  }

  layers.value = [...layers.value, layer]
  openLayer.value = layer.id
}

function removeLayer(id: number) {
  layers.value = layers.value.filter((layer) => layer.id !== id)
  if (openLayer.value === id) openLayer.value = layers.value[0]?.id ?? null
}

function toggleLayer(id: number) {
  openLayer.value = openLayer.value === id ? null : id
}

function update<K extends keyof ShadowLayer>(id: number, key: K, value: ShadowLayer[K]) {
  layers.value = layers.value.map((layer) => (layer.id === id ? { ...layer, [key]: value } : layer))
}

const boxShadow = computed(() => shadowToCss(layers.value))

const css = computed(() =>
  [`border-radius: ${radius.value}px;`, `box-shadow: ${boxShadow.value};`].join('\n'),
)
</script>

<template>
  <div>
    <ToolIntro
      kicker="Tools — 09"
      cover-line="A shadow is a claim about where the light is."
      lead="One layer looks like a sticker. Two layers — a wide ambient wash and a tighter contact shadow — read as an object on a surface. Build it here, on a card that actually belongs to this site, so you can see whether it fits the brand rather than whether it fits a grey square."
    />

    <section aria-labelledby="editor-heading" class="gutter mt-20 md:mt-28">
      <h2 id="editor-heading" class="caption">Editor</h2>

      <div class="mt-8">
        <ToolChipRail v-model="preset" label="Brand presets" :chips="chips" />
      </div>

      <div class="mt-14 md:grid md:grid-cols-12 md:gap-x-8">
        <div class="md:col-span-5">
          <ToolPanel label="Corner">
            <ToolSlider v-model="radius" label="Border radius" :min="0" :max="48" unit="px" />
          </ToolPanel>

          <div class="mt-12">
            <div class="flex items-baseline justify-between gap-4">
              <h3 class="caption">Shadow layers</h3>
              <button
                type="button"
                class="caption inline-flex min-h-11 items-center gap-2 border border-ink px-4 normal-case tracking-normal transition-colors duration-200 ease-editorial hover:border-blue hover:text-blue"
                @click="addLayer"
              >
                <span aria-hidden="true">+</span>
                Add shadow layer
              </button>
            </div>

            <ul class="mt-6 border-t border-ink">
              <li v-for="layer in layers" :key="layer.id" class="border-b border-rule">
                <div class="flex items-center justify-between gap-4 py-4">
                  <button
                    type="button"
                    class="caption flex min-h-11 flex-1 items-center gap-3 text-left normal-case tracking-normal"
                    :aria-expanded="openLayer === layer.id"
                    :aria-controls="`layer-${layer.id}`"
                    @click="toggleLayer(layer.id)"
                  >
                    <span aria-hidden="true" class="text-ink-faint">
                      {{ openLayer === layer.id ? '−' : '+' }}
                    </span>
                    <span class="font-display text-[1.125rem]">{{ layer.name }}</span>
                    <span class="tabular-nums text-ink-faint">
                      {{ layer.x }}/{{ layer.y }}/{{ layer.blur }}/{{ layer.spread }}
                    </span>
                  </button>

                  <button
                    type="button"
                    class="caption min-h-11 px-3 normal-case tracking-normal text-ink-muted transition-colors duration-200 ease-editorial hover:text-fail"
                    :aria-label="`Remove the ${layer.name} layer`"
                    @click="removeLayer(layer.id)"
                  >
                    Remove
                  </button>
                </div>

                <div v-show="openLayer === layer.id" :id="`layer-${layer.id}`" class="pb-8">
                  <div class="grid gap-6 sm:grid-cols-2">
                    <ToolSlider
                      :label="`${layer.name} — offset X`"
                      :model-value="layer.x"
                      :min="-48"
                      :max="48"
                      unit="px"
                      @update:model-value="update(layer.id, 'x', $event)"
                    />
                    <ToolSlider
                      :label="`${layer.name} — offset Y`"
                      :model-value="layer.y"
                      :min="-48"
                      :max="48"
                      unit="px"
                      @update:model-value="update(layer.id, 'y', $event)"
                    />
                    <ToolSlider
                      :label="`${layer.name} — blur`"
                      :model-value="layer.blur"
                      :min="0"
                      :max="96"
                      unit="px"
                      @update:model-value="update(layer.id, 'blur', $event)"
                    />
                    <ToolSlider
                      :label="`${layer.name} — spread`"
                      :model-value="layer.spread"
                      :min="-48"
                      :max="48"
                      unit="px"
                      @update:model-value="update(layer.id, 'spread', $event)"
                    />
                    <ToolSlider
                      :label="`${layer.name} — opacity`"
                      :model-value="layer.opacity"
                      :min="0"
                      :max="100"
                      unit="%"
                      @update:model-value="update(layer.id, 'opacity', $event)"
                    />
                    <div>
                      <ColorPickerField
                        :label="`${layer.name} — colour`"
                        :model-value="layer.color"
                        @update:model-value="update(layer.id, 'color', $event)"
                      />
                    </div>
                  </div>

                  <label class="caption mt-6 flex min-h-11 items-center gap-3 normal-case tracking-normal">
                    <input
                      type="checkbox"
                      :checked="layer.inset"
                      class="size-4 accent-blue"
                      @change="update(layer.id, 'inset', ($event.target as HTMLInputElement).checked)"
                    />
                    Inset
                  </label>
                </div>
              </li>
            </ul>

            <p v-if="layers.length === 0" class="caption mt-6 normal-case tracking-normal text-ink-muted">
              No layers. The card below has no shadow at all — which is a legitimate answer.
            </p>
          </div>
        </div>

        <div class="mt-16 md:col-span-6 md:col-start-7 md:mt-0">
          <p class="caption mb-6">Preview</p>

          <!-- Deliberately a real content card: same rule, same caption tier,
               same measure as a /work entry, so the shadow is judged in context. -->
          <article
            class="bg-paper p-8 transition-shadow duration-200 ease-editorial"
            :style="{ borderRadius: `${radius}px`, boxShadow }"
          >
            <p class="caption">Design system governance</p>
            <h3 class="mt-6 font-display text-title text-balance measure-tight">
              Four buttons, all named Button.
            </h3>
            <p class="mt-4 measure text-ink-muted">
              The parser resolves every consumer of a component before it reports a single finding,
              so severity is measured in teams affected rather than in files touched.
            </p>
            <p class="mt-8">
              <AppLink to="/work" accent="blue">Read the case</AppLink>
            </p>
          </article>

          <div class="mt-12">
            <CodeBlock :code="css" label="Copy-ready CSS" copy-label="Copy CSS" />
          </div>
        </div>
      </div>
    </section>

    <ToolFooterNav slug="shadow-playground" />
  </div>
</template>
