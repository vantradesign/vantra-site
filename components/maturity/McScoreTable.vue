<script setup lang="ts">
import { findLevel, type AssessmentResult } from '@vantra-design/maturity-core'

/**
 * Accessible tabular counterpart to the radar chart.
 *
 * [A11y] The radar is `aria-hidden`; this table carries the actual data for
 * screen readers and keyboard users.
 */
const props = defineProps<{ result: AssessmentResult; labels: Record<string, string> }>()

const t = useMcT()
const m = useMcMessages()
const catalog = useMcCatalog()
</script>

<template>
  <div
    class="overflow-x-auto"
    tabindex="0"
    role="region"
    :aria-label="m('tableCaption')"
  >
    <table class="w-full border-collapse text-left">
      <caption class="caption mb-4 text-left normal-case tracking-normal">
        {{ m('tableCaption') }}
      </caption>
      <thead>
        <tr class="border-y border-ink">
          <th scope="col" class="caption py-3 pr-6 align-bottom text-ink">{{ m('tableDimension') }}</th>
          <th scope="col" class="caption py-3 pr-6 align-bottom text-ink">{{ m('tableScore') }}</th>
          <th scope="col" class="caption py-3 pr-6 align-bottom text-ink">{{ m('tableLevel') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="category in result.categories"
          :key="category.categoryId"
          class="border-b border-rule"
        >
          <th scope="row" class="py-4 pr-6 align-top font-normal">
            {{ labels[category.categoryId] ?? category.categoryId }}
          </th>
          <td class="py-4 pr-6 align-top tabular-nums">
            <template v-if="category.score !== null">
              <span>{{ category.score.toFixed(2) }}</span>
              <div class="mt-1.5 h-1.5 w-20 bg-rule">
                <div
                  class="h-full bg-blue transition-[width] duration-500 ease-editorial"
                  :style="{ width: `${Math.max(0, Math.min(100, ((category.score - 1) / 4) * 100))}%` }"
                />
              </div>
            </template>
            <span v-else class="text-ink-muted">{{ m('tableNotAnswered') }}</span>
          </td>
          <td class="py-4 pr-6 align-top text-ink-muted">
            <template v-if="category.level !== null">
              {{ t(findLevel(catalog, category.level)?.name) }}
            </template>
            <template v-else>
              {{ m('tableAnsweredOf', { answered: category.answered, total: category.total }) }}
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
