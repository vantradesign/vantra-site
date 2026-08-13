/**
 * Nuxt auto-imports the Vue API, so `.vue` files here call `ref` and `computed`
 * as free identifiers. Vitest is not Nuxt, so those names have to exist on the
 * global object before a component can be mounted.
 *
 * This is deliberately a list of Vue's own exports and nothing else. Shimming
 * Nuxt composables here would let a component pass a test while depending on
 * something the real app does not provide — if a component needs `useRoute`, that
 * is a sign it should take a prop instead.
 */

import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  shallowRef,
  toRaw,
  useId,
  watch,
  watchEffect,
} from 'vue'

Object.assign(globalThis, {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  shallowRef,
  toRaw,
  useId,
  watch,
  watchEffect,
})
