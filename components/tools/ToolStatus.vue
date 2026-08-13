<script setup lang="ts">
/**
 * One live region per tool, announcing the result as a sentence.
 *
 * [A11y] Replaces the per-value `aria-live="polite"` that used to sit directly on
 * each computed number. Three problems with that arrangement:
 *
 * 1. The announcement was a bare number — "4.62" — with nothing saying what had
 *    changed or what it meant. On the contrast checker the pass/fail verdicts, the
 *    actual answer, were not in a live region at all, so the one thing a
 *    screen-reader user needed was the one thing never spoken.
 * 2. Several tools had two or three independent polite regions recomputing from
 *    the same inputs, so a single keystroke queued unrelated announcements that
 *    interrupted each other.
 * 3. Dragging a slider fires a change per step, which floods the queue.
 *
 * So: one region, one full sentence, and a short debounce so a drag announces
 * where it landed rather than every value on the way. The visible numbers keep
 * updating instantly — this is the spoken channel only, and it is `sr-only`
 * because the sighted user can already see the result.
 *
 * The element is rendered on the server and stays in the DOM, empty, until the
 * first change. A live region added at the same moment as its content is not
 * reliably announced, and announcing the initial state on page load would be
 * noise nobody asked for.
 */
const props = withDefaults(defineProps<{ text: string; delay?: number }>(), { delay: 500 })

const announced = ref('')
let timer: ReturnType<typeof setTimeout> | undefined

watch(
  () => props.text,
  (next) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      announced.value = next
    }, props.delay)
  },
)

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <p role="status" class="sr-only">{{ announced }}</p>
</template>
