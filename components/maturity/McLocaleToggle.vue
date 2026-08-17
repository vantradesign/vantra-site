<script setup lang="ts">
import type { Locale } from '@vantra-design/maturity-core'

const locale = useMcLocale()
const m = useMcMessages()
const options: { value: Locale; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'de', label: 'DE' },
]
</script>

<template>
  <fieldset class="flex items-center gap-1">
    <legend class="sr-only">{{ m('language') }}</legend>
    <label
      v-for="option in options"
      :key="option.value"
      class="cursor-pointer border border-transparent px-2 py-1 text-caption transition-colors duration-200 ease-editorial hover:border-rule has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue"
    >
      <input v-model="locale" type="radio" name="mc-locale" :value="option.value" class="sr-only" />
      {{ option.label }}
    </label>
  </fieldset>
</template>
