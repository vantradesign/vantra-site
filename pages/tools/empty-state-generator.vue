<!--
  PM FRAMING
  Problem: Empty states are the most-deferred UX task in product work. Teams
  ship "No results found" with no CTA, no explanation, and no voice. Good
  empty-state copy requires UX-writing craft that most teams do not have.
  Audience: Product designers and UX writers building component libraries.
  Done: Category-aware microcopy and layout templates for the five common
  empty-state types, with a preview and exportable as Vue/React component
  snippets.

  NOT "just another generator": this is genuinely uncommon — no free tool
  generates structured empty-state content with both copy and layout. Most
  "empty state" results are Figma templates, not interactive generators.
-->
<script setup lang="ts">

import { lucideIcons, DEFAULT_ICONS, findIcon } from '~/utils/tools/lucide-icons'

useToolPageSeo({
  slug: 'empty-state-generator',
  title: 'Empty State Generator',
  description:
    'Generate microcopy and layout templates for empty states — no-data, error, first-use, permission-denied. Export as Vue or React component snippets.',
})

const { copy } = useCopyToClipboard()

// ── Categories ─────────────────────────────────────────────────────────────

interface EmptyStateCategory {
  id: string
  label: string
  description: string
}

const categories: EmptyStateCategory[] = [
  { id: 'no-data', label: 'No data', description: 'The collection is empty — nothing to show yet.' },
  { id: 'no-results', label: 'No results', description: 'A search or filter returned zero matches.' },
  { id: 'error', label: 'Error', description: 'Something went wrong while loading.' },
  { id: 'first-use', label: 'First use', description: 'The user has not set up the feature yet.' },
  { id: 'permission-denied', label: 'Permission denied', description: 'The user lacks access to this resource.' },
]

const selectedCategory = ref('no-data')

const currentCategory = computed(() =>
  categories.find((c) => c.id === selectedCategory.value)!,
)

// ── Copy templates ─────────────────────────────────────────────────────────

interface CopyTemplate {
  headline: string
  body: string
  cta: string
}

const COPY_TEMPLATES: Record<string, CopyTemplate[]> = {
  'no-data': [
    {
      headline: 'Nothing here yet.',
      body: 'This is where your items will appear once you create them. Start with your first one — it only takes a moment.',
      cta: 'Create your first item',
    },
    {
      headline: 'Your collection is empty.',
      body: 'Items you add will show up here. You can always come back to this view later.',
      cta: 'Add an item',
    },
    {
      headline: 'Start building.',
      body: 'There is nothing in this space yet. Once you add something, this is where it lives.',
      cta: 'Get started',
    },
  ],
  'no-results': [
    {
      headline: 'No matches found.',
      body: 'Try adjusting your search terms or clearing a filter. Sometimes a shorter query finds more.',
      cta: 'Clear filters',
    },
    {
      headline: 'Nothing matches that.',
      body: 'We looked everywhere, but nothing fits your current filters. Try a broader search or remove some criteria.',
      cta: 'Reset search',
    },
    {
      headline: 'Zero results.',
      body: 'No items match your current query. Check for typos, or try a different combination of filters.',
      cta: 'Clear all filters',
    },
  ],
  error: [
    {
      headline: 'Something went wrong.',
      body: 'We could not load this content. This is usually temporary — try again in a moment, and if it persists, let us know.',
      cta: 'Try again',
    },
    {
      headline: 'That did not work.',
      body: 'An error occurred while loading this page. Refreshing usually helps. If not, our team has already been notified.',
      cta: 'Reload',
    },
    {
      headline: 'We hit a wall.',
      body: 'This content failed to load. It is almost certainly our end, not yours. Please try again shortly.',
      cta: 'Retry',
    },
  ],
  'first-use': [
    {
      headline: 'Welcome. Let us set this up.',
      body: 'This feature is ready to go — it just needs a few details from you to get started. It takes about two minutes.',
      cta: 'Start setup',
    },
    {
      headline: 'You are almost there.',
      body: 'Complete the initial configuration to unlock this feature. We will walk you through each step.',
      cta: 'Configure now',
    },
    {
      headline: 'First time here? Good.',
      body: 'This is where the magic happens — once you finish setup. It is quick, and you only do it once.',
      cta: 'Begin',
    },
  ],
  'permission-denied': [
    {
      headline: 'You do not have access to this.',
      body: 'This content requires a different permission level. If you think you should have access, contact your admin.',
      cta: 'Request access',
    },
    {
      headline: 'Access restricted.',
      body: 'Your current role does not include this feature. An admin can grant access if your team needs it.',
      cta: 'Contact admin',
    },
    {
      headline: 'Not available to your role.',
      body: 'This page is limited to users with elevated permissions. Reach out to your workspace owner to request access.',
      cta: 'Learn more',
    },
  ],
}

const variantIndex = ref(0)

const currentTemplate = computed(() => {
  const templates = COPY_TEMPLATES[selectedCategory.value] ?? []
  return templates[variantIndex.value % templates.length]
})

function nextVariant() {
  const templates = COPY_TEMPLATES[selectedCategory.value] ?? []
  variantIndex.value = (variantIndex.value + 1) % templates.length
}

// Watch category changes to reset variant and icon
watch(selectedCategory, () => {
  variantIndex.value = 0
})

// ── Icon picker ───────────────────────────────────────────────────────────

const selectedIconName = ref('')
const iconPickerOpen = ref(false)

const selectedIcon = computed(() => findIcon(selectedIconName.value))

const defaultIconName = computed(() => {
  const names = DEFAULT_ICONS[selectedCategory.value] ?? []
  return names[variantIndex.value % names.length] ?? 'circle-alert'
})

// Sync icon when category or variant changes
watch([selectedCategory, variantIndex], () => {
  selectedIconName.value = defaultIconName.value
}, { immediate: true })

function selectIcon(name: string) {
  selectedIconName.value = name
  iconPickerOpen.value = false
}

// ── Editable fields ────────────────────────────────────────────────────────

const editHeadline = ref('')
const editBody = ref('')
const editCta = ref('')

watch(currentTemplate, (tpl) => {
  if (tpl) {
    editHeadline.value = tpl.headline
    editBody.value = tpl.body
    editCta.value = tpl.cta
  }
}, { immediate: true })

// ── Code export ────────────────────────────────────────────────────────────

const exportFormat = ref<'vue' | 'react'>('vue')

const iconSvgForExport = computed(() => {
  const icon = selectedIcon.value
  if (!icon) return '        <circle cx="12" cy="12" r="10" />'
  return icon.svg
    .split('>') 
    .filter(Boolean)
    .map((s) => `        ${s.trim()}>`)
    .join('\n')
})

const vueSnippet = computed(() =>
  [
    '<template>',
    '  <div class="empty-state">',
    '    <div class="empty-state__icon" aria-hidden="true">',
    `      <!-- Lucide: ${selectedIconName.value} (ISC License) -->`,
    '      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">',
    iconSvgForExport.value,
    '      </svg>',
    '    </div>',
    '',
    '    <h2 class="empty-state__headline">{{ headline }}</h2>',
    '    <p class="empty-state__body">{{ body }}</p>',
    '',
    '    <button',
    '      v-if="ctaLabel"',
    '      class="empty-state__cta"',
    '      @click="$emit(\'action\')"',
    '    >',
    '      {{ ctaLabel }}',
    '    </button>',
    '  </div>',
    '</template>',
    '',
    '<script setup lang="ts">',
    'withDefaults(defineProps<{',
    '  headline?: string',
    '  body?: string',
    '  ctaLabel?: string',
    '}>(), {',
    `  headline: '${editHeadline.value.replace(/'/g, "\\'")}',`,
    `  body: '${editBody.value.replace(/'/g, "\\'")}',`,
    `  ctaLabel: '${editCta.value.replace(/'/g, "\\'")}',`,
    '})',
    '',
    "defineEmits<{ action: [] }>()",
    '</' + 'script>',
  ].join('\n'),
)

const reactIconSvg = computed(() => {
  const icon = selectedIcon.value
  if (!icon) return '          <circle cx="12" cy="12" r="10" />'
  return icon.svg
    .replace(/stroke-width/g, 'strokeWidth')
    .replace(/stroke-linecap/g, 'strokeLinecap')
    .replace(/stroke-linejoin/g, 'strokeLinejoin')
    .replace(/fill-rule/g, 'fillRule')
    .replace(/clip-rule/g, 'clipRule')
    .split('>')
    .filter(Boolean)
    .map((s) => `          ${s.trim()}>`)
    .join('\n')
})

const reactSnippet = computed(() =>
  [
    'interface EmptyStateProps {',
    '  headline?: string;',
    '  body?: string;',
    '  ctaLabel?: string;',
    '  onAction?: () => void;',
    '}',
    '',
    'export function EmptyState({',
    `  headline = '${editHeadline.value.replace(/'/g, "\\'")}',`,
    `  body = '${editBody.value.replace(/'/g, "\\'")}',`,
    `  ctaLabel = '${editCta.value.replace(/'/g, "\\'")}',`,
    '  onAction,',
    '}: EmptyStateProps) {',
    '  return (',
    '    <div className="empty-state">',
    '      <div className="empty-state__icon" aria-hidden="true">',
    `        {/* Lucide: ${selectedIconName.value} (ISC License) */}`,
    '        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">',
    reactIconSvg.value,
    '        </svg>',
    '      </div>',
    '',
    '      <h2 className="empty-state__headline">{headline}</h2>',
    '      <p className="empty-state__body">{body}</p>',
    '',
    '      {ctaLabel && (',
    '        <button className="empty-state__cta" onClick={onAction}>',
    '          {ctaLabel}',
    '        </button>',
    '      )}',
    '    </div>',
    '  );',
    '}',
  ].join('\n'),
)

const currentSnippet = computed(() =>
  exportFormat.value === 'vue' ? vueSnippet.value : reactSnippet.value,
)

// ── Status text ────────────────────────────────────────────────────────────

const statusText = computed(() =>
  `Category: ${currentCategory.value.label}. Variant ${variantIndex.value + 1} of ${(COPY_TEMPLATES[selectedCategory.value] ?? []).length}. Icon: ${selectedIconName.value}.`,
)
</script>

<template>
  <div>
    <ToolIntro
      kicker="Tools — 18"
      cover-line="An empty state is a first impression wearing the wrong clothes."
      lead="'No results found.' Three words, zero help. A good empty state names what happened, says what the person can do about it, and offers a way forward — in the same voice as the rest of the product. This generates that copy for five common categories, previews it in a real layout, and exports it as a Vue or React component."
    />

    <section aria-labelledby="category-heading" class="gutter mt-20 md:mt-28">
      <h2 id="category-heading" class="caption">Category</h2>

      <div class="mt-6">
        <ToolToggle
          v-model="selectedCategory"
          label="Empty-state category"
          :options="categories.map((c) => ({ value: c.id, label: c.label }))"
        />
      </div>

      <p class="caption mt-4 normal-case tracking-normal text-ink-muted">
        {{ currentCategory.description }}
      </p>
    </section>

    <section aria-labelledby="preview-heading" class="gutter mt-section">
      <h2 id="preview-heading" class="caption">Preview</h2>

      <div class="mt-8 md:grid md:grid-cols-12 md:gap-x-8">
        <!-- Editable copy -->
        <div class="md:col-span-5">
          <div>
            <label class="caption block" for="es-headline">Headline</label>
            <input
              id="es-headline"
              v-model="editHeadline"
              type="text"
              class="mt-2 w-full appearance-none border-b border-rule bg-transparent py-3 font-display text-title text-ink outline-none transition-colors duration-200 ease-editorial focus:border-ink"
            />
          </div>

          <div class="mt-8">
            <label class="caption block" for="es-body">Body</label>
            <textarea
              id="es-body"
              v-model="editBody"
              rows="3"
              class="mt-2 w-full appearance-none resize-none border-b border-rule bg-transparent py-3 text-body text-ink outline-none transition-colors duration-200 ease-editorial focus:border-ink"
            />
          </div>

          <div class="mt-8">
            <label class="caption block" for="es-cta">CTA label</label>
            <input
              id="es-cta"
              v-model="editCta"
              type="text"
              class="mt-2 w-full appearance-none border-b border-rule bg-transparent py-3 text-body text-ink outline-none transition-colors duration-200 ease-editorial focus:border-ink"
            />
          </div>

          <!-- Icon picker -->
          <div class="mt-8">
            <p class="caption">Icon</p>
            <button
              type="button"
              class="mt-3 flex items-center gap-3 border border-rule px-4 py-3 transition-colors duration-200 ease-editorial hover:border-ink"
              :aria-expanded="iconPickerOpen"
              aria-controls="icon-picker-grid"
              @click="iconPickerOpen = !iconPickerOpen"
            >
              <svg
                v-if="selectedIcon"
                width="24" height="24" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round"
                class="shrink-0 text-ink"
                aria-hidden="true"
                v-html="selectedIcon.svg"
              />
              <span class="text-body text-ink-muted">{{ selectedIcon?.label ?? 'Choose icon' }}</span>
            </button>

            <div
              v-if="iconPickerOpen"
              id="icon-picker-grid"
              class="mt-3 max-h-64 overflow-y-auto border border-rule p-3"
              role="listbox"
              :aria-label="'Choose an icon'"
            >
              <div class="grid grid-cols-6 gap-1 sm:grid-cols-8">
                <button
                  v-for="icon in lucideIcons"
                  :key="icon.name"
                  type="button"
                  role="option"
                  :aria-selected="icon.name === selectedIconName"
                  :aria-label="icon.label"
                  :title="icon.label"
                  class="flex items-center justify-center rounded p-2 transition-colors duration-150 ease-editorial"
                  :class="icon.name === selectedIconName ? 'bg-ink text-paper' : 'text-ink-muted hover:bg-ink/5 hover:text-ink'"
                  @click="selectIcon(icon.name)"
                >
                  <svg
                    width="20" height="20" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="1.5"
                    stroke-linecap="round" stroke-linejoin="round"
                    aria-hidden="true"
                    v-html="icon.svg"
                  />
                </button>
              </div>
              <p class="caption mt-3 text-ink-faint normal-case tracking-normal">
                Icons from <a href="https://lucide.dev" target="_blank" rel="noopener" class="underline">Lucide</a> · ISC License
              </p>
            </div>
          </div>

          <div class="mt-8 flex items-center gap-4">
            <button
              type="button"
              class="caption inline-flex min-h-11 items-center gap-2 border border-rule px-4 normal-case tracking-normal transition-colors duration-200 ease-editorial hover:border-ink"
              @click="nextVariant"
            >
              Next variant
            </button>
          </div>
        </div>

        <!-- Live layout preview -->
        <div class="mt-12 md:col-span-6 md:col-start-7 md:mt-0">
          <div class="flex min-h-80 flex-col items-center justify-center border border-rule p-12 text-center">
            <!-- Icon slot -->
            <div class="mb-6 text-ink-muted" aria-hidden="true">
              <svg
                v-if="selectedIcon"
                width="48" height="48" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round"
                v-html="selectedIcon.svg"
              />
            </div>

            <h3 class="font-display text-title text-ink">
              {{ editHeadline }}
            </h3>

            <p class="mt-4 max-w-[36ch] text-body text-ink-muted">
              {{ editBody }}
            </p>

            <button
              v-if="editCta"
              type="button"
              class="caption mt-8 inline-flex min-h-11 items-center gap-2 border border-ink bg-ink px-6 normal-case tracking-normal text-paper transition-colors duration-200 ease-editorial hover:bg-blue hover:border-blue"
              @click.prevent
            >
              {{ editCta }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <section aria-labelledby="es-export-heading" class="gutter mt-section">
      <h2 id="es-export-heading" class="caption">Export</h2>

      <div class="mt-6 mb-6">
        <ToolToggle
          v-model="exportFormat"
          label="Component format"
          :options="[
            { value: 'vue', label: 'Vue' },
            { value: 'react', label: 'React' },
          ]"
        />
      </div>

      <CodeBlock
        :code="currentSnippet"
        :label="exportFormat === 'vue' ? 'Vue SFC' : 'React TSX'"
        :copy-label="`Copy ${exportFormat === 'vue' ? 'Vue' : 'React'} component`"
        :message="`${exportFormat === 'vue' ? 'Vue' : 'React'} component copied`"
      />
    </section>

    <ToolStatus :text="statusText" />

    <ToolReference slug="empty-state-generator" />

    <ToolFooterNav slug="empty-state-generator" />
  </div>
</template>
