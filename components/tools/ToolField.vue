<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label: string
    modelValue: string | number
    type?: 'text' | 'number'
    /** Persistent helper text. Announced with the input via aria-describedby. */
    hint?: string
    /** Validation message. Sets aria-invalid and replaces the hint visually. */
    error?: string
    min?: number
    max?: number
    step?: number
    inputmode?: 'text' | 'numeric' | 'decimal'
    placeholder?: string
    /** Unit shown inside the field, e.g. px. Decorative only. */
    suffix?: string
    autocomplete?: string
    spellcheck?: boolean
  }>(),
  { type: 'text', spellcheck: false },
)

const emit = defineEmits<{ 'update:modelValue': [string]; blur: [FocusEvent] }>()

const inputId = useId()
const describedById = useId()
const describedBy = computed(() => (props.hint || props.error ? describedById : undefined))

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div>
    <label :for="inputId" class="caption block">{{ label }}</label>

    <div class="relative mt-2">
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :min="min"
        :max="max"
        :step="step"
        :inputmode="inputmode"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :spellcheck="spellcheck"
        :aria-describedby="describedBy"
        :aria-invalid="error ? 'true' : undefined"
        class="w-full appearance-none border-b bg-transparent py-3 font-display text-title tabular-nums text-ink outline-none transition-colors duration-200 ease-editorial placeholder:text-ink-faint"
        :class="[
          error ? 'border-fail' : 'border-rule focus:border-ink',
          suffix ? 'pr-12' : '',
        ]"
        @input="onInput"
        @blur="emit('blur', $event)"
      />

      <span
        v-if="suffix"
        class="caption pointer-events-none absolute right-0 bottom-4 text-ink-faint"
        aria-hidden="true"
      >
        {{ suffix }}
      </span>
    </div>

    <p
      v-if="error || hint"
      :id="describedById"
      class="mt-2 text-[0.9375rem] leading-snug"
      :class="error ? 'text-fail' : 'text-ink-muted'"
    >
      {{ error || hint }}
    </p>
  </div>
</template>
