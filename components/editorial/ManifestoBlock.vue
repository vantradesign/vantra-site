<script setup lang="ts">
const props = defineProps<{
  statements: string[]
  kicker?: string
}>()

/* The highlight sweeps across the block as a whole, so each statement needs to
   know how many words precede it and how many words the block holds in total. */
const counts = computed(() =>
  props.statements.map((statement) => statement.split(/\s+/).filter(Boolean).length),
)

const total = computed(() => counts.value.reduce((sum, count) => sum + count, 0))

const offsets = computed(() =>
  counts.value.reduce<number[]>(
    (acc, count, index) => [...acc, acc[index] + count],
    [0],
  ),
)
</script>

<template>
  <section class="gutter mt-section">
    <div class="md:grid md:grid-cols-12">
      <p v-if="kicker" class="caption md:col-span-2 mb-6 md:mb-0 md:pt-3">{{ kicker }}</p>

      <!-- No fade-in reveal here: the scroll highlight is the entrance. -->
      <div class="highlight-scroll md:col-span-9 md:col-start-4 space-y-8">
        <HighlightText
          v-for="(statement, index) in statements"
          :key="statement"
          :text="statement"
          :offset="offsets[index]"
          :total="total"
          class="font-display text-display measure text-balance"
        />
      </div>
    </div>
  </section>
</template>
