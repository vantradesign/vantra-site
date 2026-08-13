<script setup lang="ts">
import type { Chip, ToggleOption } from '~/types/tools'
import { LAYOUT_PRESETS } from '~/utils/tools/layout-presets'
import type { LayoutMode } from '~/utils/tools/layout'

/**
 * The shell. Owns the two stores and nothing else — every control is a child,
 * and the only thing this component decides is where they sit.
 *
 * The mode toggle is a toggle rather than a second route on purpose: people flip
 * between grid and flex while deciding which one the layout wants, and the item
 * count survives the switch so the comparison is like for like.
 */
const store = useGridFlexState()
const ai = useLayoutAI()

const modes: ToggleOption[] = [
  { value: 'grid', label: 'Grid' },
  { value: 'flex', label: 'Flex' },
]

const presetChips: Chip[] = LAYOUT_PRESETS.map((preset) => ({
  value: preset.value,
  label: preset.label,
  description: preset.mode === 'grid' ? 'Grid preset' : 'Flex preset',
}))

const outputs: ToggleOption[] = [
  { value: 'css', label: 'CSS' },
  { value: 'tailwind', label: 'Tailwind' },
]

const output = ref<'css' | 'tailwind'>('css')

/**
 * Editing needs room: the canvas, the area map and the controls do not fit
 * side by side on a phone. Defaults to true so a JS-less or pre-hydration render
 * shows the full tool rather than a permanent "too small" notice.
 */
const wideEnough = ref(true)

onMounted(() => {
  const query = window.matchMedia('(min-width: 768px)')
  wideEnough.value = query.matches

  const onChange = (event: MediaQueryListEvent) => {
    wideEnough.value = event.matches
  }

  query.addEventListener('change', onChange)
  onBeforeUnmount(() => query.removeEventListener('change', onChange))
})

function onModeChange(value: string) {
  store.setMode(value as LayoutMode)
}

async function onPrompt(prompt: string) {
  await ai.generate(prompt, store.snapshot())
}

function onAccept() {
  const next = ai.accept()
  if (next) store.replace(next)
}

/**
 * Rulers default to on. The whole difficulty of grid is that the lines are
 * invisible, and a builder that hides them by default teaches the same lesson
 * badly. It is still a toggle, because they are noise once the layout is settled.
 */
const showLines = ref(true)

/**
 * Focus mode, for the complaint that the controls eat half the viewport: a fixed
 * overlay where the canvas takes three quarters and the controls become a narrow
 * scrolling rail. Not a <dialog>, because this is a view of the same document
 * rather than an interruption of it — but Escape still leaves, which is what
 * anyone who has been trapped in a full-screen editor reaches for first.
 */
const focus = ref(false)
const exitButton = ref<HTMLButtonElement | null>(null)

async function enterFocus() {
  focus.value = true
  await nextTick()
  exitButton.value?.focus()
}

function exitFocus() {
  focus.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && focus.value) exitFocus()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

/* The page behind must not scroll under the overlay. Restored on unmount too,
   since leaving the route while in focus mode would otherwise freeze the body. */
watch(focus, (active) => {
  document.body.style.overflow = active ? 'hidden' : ''
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})

const workspaceClass = computed(() =>
  focus.value
    ? 'fixed inset-0 z-50 grid grid-cols-12 gap-x-6 overflow-y-auto bg-paper p-6'
    : 'mt-12 md:grid md:grid-cols-12 md:gap-x-8',
)

const canvasClass = computed(() =>
  focus.value ? 'col-span-9 order-2' : 'md:col-span-7 md:order-2',
)

const controlsClass = computed(() =>
  focus.value ? 'col-span-3 order-1' : 'mt-16 md:col-span-5 md:order-1 md:mt-0',
)

const code = computed(() => (output.value === 'css' ? store.css.value : store.tailwindCode.value))

const copyLabel = computed(() => (output.value === 'css' ? 'Copy CSS' : 'Copy classes'))
</script>

<template>
  <div>
    <section aria-labelledby="builder-heading" class="gutter mt-20 md:mt-28">
      <h2 id="builder-heading" class="sr-only">Layout builder</h2>

      <div class="mt-10">
        <ToolChipRail
          :model-value="store.presetValue.value"
          label="Presets"
          :chips="presetChips"
          @update:model-value="store.usePreset($event)"
        />
        <p
          v-if="store.activePreset.value"
          class="mt-3 measure text-[0.9375rem] leading-snug text-ink-muted"
        >
          {{ store.activePreset.value.note }}
        </p>
      </div>

      <p
        v-if="!wideEnough"
        class="caption mt-10 border border-rule p-4 normal-case tracking-normal text-ink-muted"
      >
        This screen is too narrow to edit a grid honestly, so the canvas below is read-only. The
        preset rail and the copy-ready output still work. Come back on a tablet or wider to draw
        regions.
      </p>

      <div :class="workspaceClass">
        <!-- One toolbar for both layouts, so focus mode is a change of proportion
             rather than a second set of controls to keep in step. -->
        <div
          class="col-span-full flex flex-wrap items-end justify-between gap-x-6 gap-y-4"
          :class="focus ? 'order-1 mb-4' : 'mb-10'"
        >
          <ToolToggle
            :model-value="store.state.mode"
            :options="modes"
            label="Layout model"
            @update:model-value="onModeChange"
          />

          <div class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="caption min-h-11 border px-4 normal-case tracking-normal transition-colors duration-200 ease-editorial"
              :class="
                showLines
                  ? 'border-ink bg-ink text-paper'
                  : 'border-rule text-ink-muted hover:border-ink'
              "
              :aria-pressed="showLines"
              @click="showLines = !showLines"
            >
              Grid lines
            </button>

            <button
              type="button"
              class="caption min-h-11 border border-ink px-4 normal-case tracking-normal transition-colors duration-200 ease-editorial hover:border-blue hover:text-blue"
              @click="store.addItem()"
            >
              + Add an item
            </button>

            <button
              v-if="!focus"
              type="button"
              class="caption min-h-11 border border-ink px-4 normal-case tracking-normal transition-colors duration-200 ease-editorial hover:border-blue hover:text-blue"
              :aria-pressed="false"
              @click="enterFocus()"
            >
              Focus mode
            </button>

            <button
              v-else
              ref="exitButton"
              type="button"
              class="caption min-h-11 border border-ink bg-ink px-4 normal-case tracking-normal text-paper transition-colors duration-200 ease-editorial hover:border-blue hover:bg-blue"
              :aria-pressed="true"
              @click="exitFocus()"
            >
              Exit focus mode — Esc
            </button>
          </div>
        </div>

        <!-- Canvas first in the source order: it is the thing being made, and on a
             narrow screen it should arrive before three panels of controls. -->
        <div :class="canvasClass">
          <div class="md:sticky md:top-8">
            <div class="flex items-baseline justify-between gap-4">
              <p class="caption">Canvas</p>
              <p v-if="ai.preview.value" class="caption normal-case tracking-normal text-blue">
                Showing a suggestion — accept or discard it below.
              </p>
            </div>

            <div v-if="ai.pending.value" class="mt-3 min-h-[22rem] border border-rule p-4">
              <div class="grid h-full gap-4 sm:grid-cols-3" aria-hidden="true">
                <div v-for="n in 6" :key="n" class="min-h-16 animate-pulse bg-rule" />
              </div>
              <!-- [A11y] Not a live region. This element is inserted together
                   with its text, and a region added at the same time as its
                   content is not reliably announced. AIPromptBar reports the
                   pending state from a region that is always in the DOM, so
                   marking this one live would duplicate it at best. -->
              <p class="caption mt-4 normal-case tracking-normal text-ink-muted">
                Waiting for the local model…
              </p>
            </div>

            <div v-else class="mt-3">
              <LayoutCanvas
                :store="store"
                :preview-state="ai.preview.value"
                :interactive="wideEnough"
                :show-lines="showLines"
              />
            </div>

            <div class="mt-10">
              <ToolToggle v-model="output" :options="outputs" label="Output" />

              <div class="mt-6">
                <CodeBlock
                  :code="code"
                  :label="output === 'css' ? 'Copy-ready CSS' : 'Copy-ready Tailwind v4'"
                  :copy-label="copyLabel"
                  :message="output === 'css' ? 'Layout copied as CSS' : 'Layout copied as Tailwind classes'"
                />
              </div>

              <p
                v-if="output === 'tailwind'"
                class="mt-4 measure text-[0.9375rem] leading-snug text-ink-muted"
              >
                Arbitrary values cannot contain spaces, so track lists are joined with underscores.
                Named areas have no utility at all — the container needs the
                <code class="font-mono">grid-template-areas</code> string from the CSS tab, which is
                the honest reason to prefer plain CSS for layouts of any size.
              </p>
            </div>
          </div>
        </div>

        <div :class="controlsClass">
          <ul v-if="store.state.items.length" class="mb-12 border-t border-ink">
            <li
              v-for="item in store.state.items"
              :key="item.id"
              class="flex items-center justify-between gap-4 border-b border-rule"
            >
              <button
                type="button"
                class="caption min-h-11 flex-1 text-left normal-case tracking-normal"
                :class="store.state.selectedId === item.id ? 'text-blue' : 'text-ink'"
                :aria-pressed="store.state.selectedId === item.id"
                @click="store.select(item.id)"
              >
                {{ item.name }}
                <span v-if="item.subgrid.enabled" class="text-ink-faint">· subgrid</span>
              </button>

              <button
                type="button"
                class="caption min-h-11 px-2 normal-case tracking-normal text-ink-muted transition-colors duration-200 ease-editorial hover:text-fail"
                :aria-label="`Remove ${item.name}`"
                @click="store.removeItem(item.id)"
              >
                Remove
              </button>
            </li>
          </ul>

          <GridControls v-if="store.state.mode === 'grid'" :store="store" />
          <FlexControls v-else :store="store" />
        </div>
      </div>

      <div class="mt-section">
        <AIPromptBar :ai="ai" @submit="onPrompt" @accept="onAccept" @discard="ai.discard()" />
      </div>
    </section>
  </div>
</template>
