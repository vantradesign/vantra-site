<script setup lang="ts">
import { isValidHex, normalizeHex } from '~/utils/tools/color'

const props = defineProps<{
  label: string
  /** Always a normalised #rrggbb value. */
  modelValue: string
  hint?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [string] }>()

const textId = useId()
const swatchId = useId()
const hintId = useId()

/** Local draft so a half-typed hex is not rejected on every keystroke. */
const draft = ref(props.modelValue)

watch(
  () => props.modelValue,
  (value) => {
    if (normalizeHex(draft.value) !== value) draft.value = value
  },
)

const invalid = computed(() => draft.value.trim() !== '' && !isValidHex(draft.value))

function onText(event: Event) {
  const value = (event.target as HTMLInputElement).value
  draft.value = value

  const normalized = normalizeHex(value)
  if (normalized) emit('update:modelValue', normalized)
}

function onSwatch(event: Event) {
  const value = (event.target as HTMLInputElement).value
  draft.value = value
  emit('update:modelValue', value.toLowerCase())
}
</script>

<template>
  <div>
    <label :for="textId" class="caption block">{{ label }}</label>

    <div class="mt-3 flex items-stretch gap-3">
      <!-- The native picker sits behind a large swatch: the input itself is
           opacity-0 rather than hidden, so it keeps its own focus ring and
           label association. -->
      <div class="relative size-16 shrink-0 border" :class="invalid ? 'border-fail' : 'border-ink'">
        <span
          class="absolute inset-0"
          :style="{ backgroundColor: modelValue }"
          aria-hidden="true"
        />
        <input
          :id="swatchId"
          type="color"
          :value="modelValue"
          class="absolute inset-0 size-full cursor-pointer opacity-0"
          :aria-label="`${label} — colour picker`"
          @input="onSwatch"
        />
      </div>

      <div class="flex-1">
        <input
          :id="textId"
          type="text"
          :value="draft"
          inputmode="text"
          spellcheck="false"
          autocomplete="off"
          placeholder="#000000"
          maxlength="7"
          :aria-describedby="hint || invalid ? hintId : undefined"
          :aria-invalid="invalid ? 'true' : undefined"
          class="h-16 w-full appearance-none border-b bg-transparent font-display text-title tabular-nums text-ink outline-none transition-colors duration-200 ease-editorial placeholder:text-ink-faint"
          :class="invalid ? 'border-fail' : 'border-rule focus:border-ink'"
          @input="onText"
        />
      </div>
    </div>

    <p
      v-if="invalid || hint"
      :id="hintId"
      class="mt-2 text-[0.9375rem] leading-snug"
      :class="invalid ? 'text-fail' : 'text-ink-muted'"
    >
      {{ invalid ? 'Not a hex value. Use three or six digits, e.g. #021f94.' : hint }}
    </p>
  </div>
</template>
