<script setup lang="ts">
import { bestTextOn, formatRatio } from '~/utils/tools/color'
import {
  assignRoles,
  generateMatrix,
  filterPairs,
  sortPairs,
  summarise,
  type TokenWithRole,
  type ContrastPair,
  type FilterOptions,
  type SortField,
  type SortDirection,
  type WcagLevel,
  type TextSize,
  type TokenRole,
} from '~/utils/tools/contrast-batch'
import type { ParsedColorToken } from '~/utils/tools/token-parser'

const props = defineProps<{
  tokens: ParsedColorToken[]
  filename: string
  warnings: string[]
}>()

const emit = defineEmits<{ reset: [] }>()

// ── Role assignment ────────────────────────────────────────────────────────

const tokensWithRoles = ref<TokenWithRole[]>([])

watch(
  () => props.tokens,
  (tokens) => {
    tokensWithRoles.value = assignRoles(tokens)
  },
  { immediate: true },
)

function setRole(index: number, role: TokenRole) {
  const token = tokensWithRoles.value[index]
  if (token) token.role = role
}

const roleOptions: { value: TokenRole; label: string }[] = [
  { value: 'foreground', label: 'Text' },
  { value: 'background', label: 'Background' },
  { value: 'unassigned', label: 'Both' },
]

// ── Matrix computation ─────────────────────────────────────────────────────

const allPairs = computed(() => generateMatrix(tokensWithRoles.value))
const summary = computed(() => summarise(allPairs.value))

// ── Filtering & sorting ────────────────────────────────────────────────────

const filterShow = ref<'all' | 'pass' | 'fail'>('all')
const filterLevel = ref<WcagLevel>('aa')
const filterTextSize = ref<TextSize>('normal')
const sortField = ref<SortField>('ratio')
const sortDirection = ref<SortDirection>('asc')

const filterOptions = computed<FilterOptions>(() => ({
  showOnly: filterShow.value,
  level: filterLevel.value,
  textSize: filterTextSize.value,
}))

const visiblePairs = computed(() => {
  const filtered = filterPairs(allPairs.value, filterOptions.value)
  return sortPairs(filtered, sortField.value, sortDirection.value)
})

function toggleSort(field: SortField) {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = field === 'ratio' ? 'asc' : 'asc'
  }
}

function sortAriaLabel(field: SortField, label: string): string {
  if (sortField.value !== field) return `Sort by ${label}`
  return `Sort by ${label}, currently ${sortDirection.value === 'asc' ? 'ascending' : 'descending'}`
}

// ── Active threshold for pass/fail display ─────────────────────────────────

function pairPasses(pair: ContrastPair): boolean {
  if (filterLevel.value === 'aaa') return pair.passesAaaNormal
  return filterTextSize.value === 'large' ? pair.passesAaLarge : pair.passesAaNormal
}

function thresholdLabel(): string {
  if (filterLevel.value === 'aaa') return 'AAA 7:1'
  return filterTextSize.value === 'large' ? 'AA Large 3:1' : 'AA Normal 4.5:1'
}

// ── Status text for screen readers ─────────────────────────────────────────

const statusText = computed(() => {
  const total = allPairs.value.length
  if (total === 0) return 'No contrast pairs to check. Assign at least one text and one background token.'
  const pass = filterLevel.value === 'aaa' ? summary.value.passAaaNormal
    : filterTextSize.value === 'large' ? summary.value.passAaLarge
    : summary.value.passAaNormal
  return `${pass} of ${total} pairs pass ${thresholdLabel()}. Showing ${visiblePairs.value.length} results.`
})

const tokenTableId = useId()
const resultsTableId = useId()
</script>

<template>
  <div>
    <!-- File info & reset -->
    <div class="flex flex-wrap items-baseline justify-between gap-4">
      <p class="caption">
        {{ props.filename }} — {{ props.tokens.length }} colour token{{ props.tokens.length !== 1 ? 's' : '' }}
      </p>
      <button
        type="button"
        class="caption inline-flex min-h-11 items-center gap-2 border border-rule px-4 normal-case tracking-normal transition-colors duration-200 ease-editorial hover:border-ink"
        @click="emit('reset')"
      >
        Upload different file
      </button>
    </div>

    <!-- Warnings -->
    <ul v-if="props.warnings.length > 0" class="mt-4 space-y-1">
      <li
        v-for="(warning, i) in props.warnings"
        :key="i"
        class="text-[0.875rem] leading-snug text-ink-muted"
      >
        ⚠ {{ warning }}
      </li>
    </ul>

    <!-- Token list with role assignment -->
    <section :aria-labelledby="tokenTableId" class="mt-8 border-t border-ink pt-6">
      <h3 :id="tokenTableId" class="caption">Token roles</h3>
      <p class="mt-2 text-[0.875rem] text-ink-muted measure">
        Assign each token as text (foreground), background, or both. The matrix below checks every text token against every background token.
      </p>

      <div class="mt-4 overflow-x-auto">
        <table class="w-full text-[0.875rem]">
          <thead>
            <tr class="border-b border-ink text-left">
              <th scope="col" class="caption py-2 pr-4 font-bold">Swatch</th>
              <th scope="col" class="caption py-2 pr-4 font-bold">Name</th>
              <th scope="col" class="caption py-2 pr-4 font-bold">Value</th>
              <th scope="col" class="caption py-2 font-bold">Role</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(token, index) in tokensWithRoles"
              :key="`${token.source}-${token.path.join('.')}`"
              class="border-b border-rule"
            >
              <td class="py-2 pr-4">
                <span
                  class="inline-block size-5 border border-ink/15"
                  :style="{ backgroundColor: token.hex }"
                  :aria-label="`Colour swatch: ${token.hex}`"
                />
              </td>
              <td class="py-2 pr-4 font-bold">
                {{ token.name }}
                <span v-if="token.resolvedFrom" class="font-normal text-ink-muted">
                  → {{ token.resolvedFrom }}
                </span>
              </td>
              <td class="py-2 pr-4 tabular-nums text-ink-muted">{{ token.hex }}</td>
              <td class="py-2">
                <span class="inline-flex border border-ink">
                  <label
                    v-for="option in roleOptions"
                    :key="option.value"
                    class="contents"
                  >
                    <input
                      type="radio"
                      :name="`role-${index}`"
                      :value="option.value"
                      :checked="token.role === option.value"
                      class="peer sr-only"
                      @change="setRole(index, option.value)"
                    />
                    <span
                      class="caption flex items-center px-3 py-1 normal-case tracking-normal transition-colors duration-200 ease-editorial peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-2 peer-focus-visible:outline-blue peer-focus-visible:shadow-[inset_0_0_0_4px_var(--color-paper)]"
                      :class="
                        token.role === option.value
                          ? 'bg-ink text-paper font-bold'
                          : 'text-ink-muted hover:text-ink'
                      "
                    >
                      {{ option.label }}
                    </span>
                  </label>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Contrast matrix results -->
    <section :aria-labelledby="resultsTableId" class="mt-10 border-t border-ink pt-6">
      <h3 :id="resultsTableId" class="caption">Contrast results</h3>

      <!-- Summary -->
      <p class="mt-3 text-body">
        <strong>{{ summary.total }}</strong> pair{{ summary.total !== 1 ? 's' : '' }} checked.
        <span v-if="summary.total > 0" class="text-ink-muted">
          {{ filterLevel === 'aaa' ? summary.passAaaNormal : filterTextSize === 'large' ? summary.passAaLarge : summary.passAaNormal }}
          pass {{ thresholdLabel() }}.
        </span>
      </p>

      <!-- Filters -->
      <div class="mt-6 flex flex-wrap items-end gap-6">
        <div>
          <p class="caption mb-2">Show</p>
          <span class="inline-flex border border-ink" role="radiogroup" aria-label="Filter results">
            <label v-for="(opt, i) in [{ v: 'all', l: 'All' }, { v: 'pass', l: 'Pass' }, { v: 'fail', l: 'Fail' }]" :key="opt.v" class="contents">
              <input
                type="radio"
                name="filter-show"
                :value="opt.v"
                :checked="filterShow === opt.v"
                class="peer sr-only"
                @change="filterShow = opt.v as 'all' | 'pass' | 'fail'"
              />
              <span
                class="caption flex min-h-9 items-center px-4 normal-case tracking-normal transition-colors duration-200 ease-editorial peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-2 peer-focus-visible:outline-blue"
                :class="[
                  i > 0 ? 'border-l border-ink' : '',
                  filterShow === opt.v
                    ? 'bg-ink text-paper font-bold'
                    : 'text-ink-muted hover:text-ink',
                ]"
              >
                {{ opt.l }}
              </span>
            </label>
          </span>
        </div>

        <div>
          <p class="caption mb-2">Level</p>
          <span class="inline-flex border border-ink" role="radiogroup" aria-label="WCAG level">
            <label v-for="(opt, i) in [{ v: 'aa', l: 'AA' }, { v: 'aaa', l: 'AAA' }]" :key="opt.v" class="contents">
              <input
                type="radio"
                name="filter-level"
                :value="opt.v"
                :checked="filterLevel === opt.v"
                class="peer sr-only"
                @change="filterLevel = opt.v as WcagLevel"
              />
              <span
                class="caption flex min-h-9 items-center px-4 normal-case tracking-normal transition-colors duration-200 ease-editorial peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-2 peer-focus-visible:outline-blue"
                :class="[
                  i > 0 ? 'border-l border-ink' : '',
                  filterLevel === opt.v
                    ? 'bg-ink text-paper font-bold'
                    : 'text-ink-muted hover:text-ink',
                ]"
              >
                {{ opt.l }}
              </span>
            </label>
          </span>
        </div>

        <div>
          <p class="caption mb-2">Text size</p>
          <span class="inline-flex border border-ink" role="radiogroup" aria-label="Text size">
            <label v-for="(opt, i) in [{ v: 'normal', l: 'Normal' }, { v: 'large', l: 'Large' }]" :key="opt.v" class="contents">
              <input
                type="radio"
                name="filter-text-size"
                :value="opt.v"
                :checked="filterTextSize === opt.v"
                class="peer sr-only"
                @change="filterTextSize = opt.v as TextSize"
              />
              <span
                class="caption flex min-h-9 items-center px-4 normal-case tracking-normal transition-colors duration-200 ease-editorial peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-2 peer-focus-visible:outline-blue"
                :class="[
                  i > 0 ? 'border-l border-ink' : '',
                  filterTextSize === opt.v
                    ? 'bg-ink text-paper font-bold'
                    : 'text-ink-muted hover:text-ink',
                ]"
              >
                {{ opt.l }}
              </span>
            </label>
          </span>
        </div>
      </div>

      <!-- [A11y] Live region for matrix status -->
      <p role="status" class="sr-only">{{ statusText }}</p>

      <!-- Results table -->
      <div v-if="allPairs.length > 0" class="mt-6 overflow-x-auto">
        <table class="w-full text-[0.875rem]">
          <thead>
            <tr class="border-b border-ink text-left">
              <th scope="col" class="py-2 pr-4">
                <button
                  type="button"
                  class="caption font-bold hover:text-ink"
                  :aria-label="sortAriaLabel('foreground', 'foreground')"
                  @click="toggleSort('foreground')"
                >
                  Foreground
                  <span v-if="sortField === 'foreground'" aria-hidden="true">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
                </button>
              </th>
              <th scope="col" class="py-2 pr-4">
                <button
                  type="button"
                  class="caption font-bold hover:text-ink"
                  :aria-label="sortAriaLabel('background', 'background')"
                  @click="toggleSort('background')"
                >
                  Background
                  <span v-if="sortField === 'background'" aria-hidden="true">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
                </button>
              </th>
              <th scope="col" class="py-2 pr-4">Preview</th>
              <th scope="col" class="py-2 pr-4">
                <button
                  type="button"
                  class="caption font-bold hover:text-ink"
                  :aria-label="sortAriaLabel('ratio', 'contrast ratio')"
                  @click="toggleSort('ratio')"
                >
                  Ratio
                  <span v-if="sortField === 'ratio'" aria-hidden="true">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
                </button>
              </th>
              <th scope="col" class="py-2">Result</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(pair, i) in visiblePairs"
              :key="`${pair.foreground.hex}-${pair.background.hex}-${i}`"
              class="border-b border-rule"
            >
              <td class="py-2 pr-4">
                <span class="flex items-center gap-2">
                  <span
                    class="inline-block size-4 shrink-0 border border-ink/15"
                    :style="{ backgroundColor: pair.foreground.hex }"
                    aria-hidden="true"
                  />
                  <span>
                    <span class="font-bold">{{ pair.foreground.name }}</span>
                    <span class="ml-1 tabular-nums text-ink-muted">{{ pair.foreground.hex }}</span>
                  </span>
                </span>
              </td>
              <td class="py-2 pr-4">
                <span class="flex items-center gap-2">
                  <span
                    class="inline-block size-4 shrink-0 border border-ink/15"
                    :style="{ backgroundColor: pair.background.hex }"
                    aria-hidden="true"
                  />
                  <span>
                    <span class="font-bold">{{ pair.background.name }}</span>
                    <span class="ml-1 tabular-nums text-ink-muted">{{ pair.background.hex }}</span>
                  </span>
                </span>
              </td>
              <td class="py-2 pr-4">
                <span
                  class="inline-block border border-ink/10 px-2 py-1 text-[0.8125rem] font-bold leading-tight"
                  :style="{ backgroundColor: pair.background.hex, color: pair.foreground.hex }"
                >
                  Aa
                </span>
              </td>
              <td class="py-2 pr-4 tabular-nums font-bold">{{ pair.formattedRatio }}</td>
              <td class="py-2">
                <span
                  class="caption inline-flex items-center gap-1 font-bold normal-case tracking-normal"
                  :class="pairPasses(pair) ? 'text-pass' : 'text-fail'"
                >
                  <span aria-hidden="true">{{ pairPasses(pair) ? '✓' : '✕' }}</span>
                  {{ pairPasses(pair) ? 'Pass' : 'Fail' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p
        v-else-if="tokensWithRoles.length > 0"
        class="mt-6 text-body text-ink-muted"
      >
        No pairs to check. Assign at least one token as "Text" and one as "Background", or set tokens to "Both".
      </p>

      <p v-if="allPairs.length > 0 && visiblePairs.length === 0" class="mt-6 text-body text-ink-muted">
        No results match the current filter. Try changing the filter to "All".
      </p>
    </section>
  </div>
</template>
