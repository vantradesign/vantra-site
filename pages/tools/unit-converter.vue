<script setup lang="ts">
import { formatUnit, fromPx, toPx } from '~/utils/tools/scale'
import type { Unit } from '~/utils/tools/scale'

useToolPageSeo({
  slug: 'unit-converter',
  title: 'Unit Converter',
  description:
    'Convert px, rem, em and pt live against an adjustable root font size. Four synchronised fields, no submit button.',
})

const rootFontSize = ref('16')

const root = computed(() => {
  const parsed = Number(rootFontSize.value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 16
})

const rootError = computed(() =>
  Number(rootFontSize.value) > 0 ? undefined : 'Root font size must be greater than zero.',
)

/** Single source of truth. Every field is a projection of this value. */
const pixels = ref(16)

/* The field the user is typing in keeps its raw string, so 1.5 does not become
   1.500 mid-keystroke; the other three are rendered from `pixels`. */
const editing = ref<Unit | null>(null)
const draft = ref('')

const FIELDS: { unit: Unit; label: string; hint: string }[] = [
  { unit: 'px', label: 'Pixels', hint: 'Absolute. Ignores the root font size.' },
  { unit: 'rem', label: 'rem', hint: 'Relative to the root font size.' },
  { unit: 'em', label: 'em', hint: 'Relative to the parent — here, the root.' },
  { unit: 'pt', label: 'Points', hint: 'Print unit. 1pt = 1.333px at 96dpi.' },
]

function display(unit: Unit) {
  if (editing.value === unit) return draft.value
  return formatUnit(fromPx(pixels.value, unit, root.value))
}

function onInput(unit: Unit, value: string) {
  editing.value = unit
  draft.value = value

  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return

  pixels.value = toPx(parsed, unit, root.value)
}

function onBlur() {
  editing.value = null
  draft.value = ''
}

/* Changing the root must not move px or pt. It moves rem and em, because the
   pixel value is held constant and those two are derived from it. */
const css = computed(() =>
  [
    `/* ${formatUnit(pixels.value)}px at a ${formatUnit(root.value)}px root */`,
    `--size: ${formatUnit(fromPx(pixels.value, 'rem', root.value))}rem; /* ${formatUnit(pixels.value)}px */`,
  ].join('\n'),
)
</script>

<template>
  <div>
    <ToolIntro
      kicker="Tools — 08"
      cover-line="Four units, one number underneath."
      lead="px is what the screen does, rem is what the reader chose, pt is what the printer expects. They are the same measurement seen from three different places — and the conversion should never be the reason a layout is wrong."
    />

    <section aria-labelledby="root-heading" class="gutter mt-20 md:mt-28">
      <h2 id="root-heading" class="caption">Root font size</h2>

      <div class="mt-8 md:grid md:grid-cols-12 md:gap-x-8">
        <div class="md:col-span-3">
          <ToolField
            v-model="rootFontSize"
            label="Root font size"
            type="number"
            inputmode="decimal"
            :min="1"
            :step="1"
            suffix="px"
            :error="rootError"
          />
        </div>

        <p class="mt-6 measure text-ink-muted md:col-span-6 md:col-start-5 md:mt-0">
          This is the browser default, or whatever you set on <code class="font-mono">html</code>.
          Changing it moves rem and em only — px and pt are absolute and stay where they are.
        </p>
      </div>
    </section>

    <section aria-labelledby="fields-heading" class="gutter mt-section">
      <h2 id="fields-heading" class="caption">Conversion</h2>

      <ul class="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <li v-for="field in FIELDS" :key="field.unit">
          <div class="flex items-end gap-3">
            <div class="flex-1">
              <ToolField
                :label="field.label"
                :model-value="display(field.unit)"
                type="number"
                inputmode="decimal"
                :step="0.001"
                :suffix="field.unit"
                :hint="field.hint"
                @update:model-value="onInput(field.unit, $event)"
                @blur="onBlur"
              />
            </div>

            <CopyButton
              :value="`${display(field.unit)}${field.unit}`"
              variant="icon"
              :aria-label="`Copy the ${field.label} value`"
              :message="`${display(field.unit)}${field.unit} copied`"
            />
          </div>
        </li>
      </ul>
    </section>

    <section aria-labelledby="unit-output-heading" class="gutter mt-section">
      <h2 id="unit-output-heading" class="sr-only">Copy-ready output</h2>
      <CodeBlock :code="css" label="Copy-ready CSS" copy-label="Copy CSS" />
    </section>

    <ToolReference slug="unit-converter" />

    <ToolFooterNav slug="unit-converter" />
  </div>
</template>
