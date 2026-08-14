<script setup lang="ts">
import { validateFile, parseTokenFile, type ParseResult } from '~/utils/tools/token-parser'
import { downloadDemoJson, downloadDemoCss } from '~/utils/tools/demo-tokens'

const emit = defineEmits<{ parsed: [ParseResult & { filename: string }] }>()

const dragOver = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const statusMessage = ref('')

const inputId = useId()
const statusId = useId()

async function processFile(file: File) {
  error.value = null
  statusMessage.value = ''

  const validationError = validateFile(file)
  if (validationError) {
    error.value = validationError.message
    statusMessage.value = `Error: ${validationError.message}`
    return
  }

  loading.value = true
  statusMessage.value = `Reading ${file.name}…`

  try {
    const content = await file.text()
    const result = parseTokenFile(content, file.name)

    if (result.errors.length > 0) {
      const msg = result.errors.map((e) => (e.line ? `Line ${e.line}: ${e.message}` : e.message)).join(' ')
      error.value = msg
      statusMessage.value = `Error: ${msg}`
      loading.value = false
      return
    }

    const tokenCount = result.tokens.length
    const warnCount = result.warnings.length
    statusMessage.value = `Parsed ${tokenCount} colour token${tokenCount !== 1 ? 's' : ''} from ${file.name}.${warnCount > 0 ? ` ${warnCount} warning${warnCount !== 1 ? 's' : ''}.` : ''}`

    emit('parsed', { ...result, filename: file.name })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not read file.'
    error.value = message
    statusMessage.value = `Error: ${message}`
  } finally {
    loading.value = false
  }
}

function onFileInput(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) processFile(file)
  // Reset so the same file can be re-selected
  input.value = ''
}

function onDrop(event: DragEvent) {
  dragOver.value = false
  const file = event.dataTransfer?.files[0]
  if (file) processFile(file)
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
  dragOver.value = true
}

function onDragLeave() {
  dragOver.value = false
}
</script>

<template>
  <div>
    <div
      class="relative border-2 border-dashed p-8 text-center transition-colors duration-200 ease-editorial"
      :class="[
        dragOver ? 'border-blue bg-blue/5' : error ? 'border-fail' : 'border-rule',
      ]"
      @drop.prevent="onDrop"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
    >
      <p class="text-body text-ink">
        <span v-if="loading">Reading file…</span>
        <span v-else>
          Drop a <strong>.json</strong> or <strong>.css</strong> token file here, or
          <label
            :for="inputId"
            class="cursor-pointer font-bold text-blue underline underline-offset-4 hover:text-ink focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue"
          >
            choose a file
          </label>
        </span>
      </p>

      <input
        :id="inputId"
        type="file"
        accept=".json,.css"
        class="sr-only"
        :aria-describedby="statusId"
        @change="onFileInput"
      />

      <p class="mt-3 text-[0.875rem] text-ink-muted">
        Accepts W3C Design Tokens JSON, Style Dictionary JSON, flat key→value JSON, or CSS custom properties.
      </p>
    </div>

    <p class="mt-3 flex items-start gap-2 text-[0.875rem] leading-snug text-ink-muted">
      <span aria-hidden="true" class="mt-px shrink-0">🔒</span>
      <span>Your file is processed entirely in your browser and never leaves your device.</span>
    </p>

    <!-- [A11y] Live region for upload status / errors -->
    <div :id="statusId" aria-live="polite" class="sr-only">{{ statusMessage }}</div>

    <p v-if="error" role="alert" class="mt-4 text-[0.9375rem] leading-snug text-fail">
      {{ error }}
    </p>

    <div class="mt-6 flex flex-wrap gap-3">
      <button
        type="button"
        class="caption inline-flex min-h-11 items-center gap-2 border border-rule px-4 normal-case tracking-normal transition-colors duration-200 ease-editorial hover:border-ink"
        @click="downloadDemoJson"
      >
        Download demo JSON
      </button>
      <button
        type="button"
        class="caption inline-flex min-h-11 items-center gap-2 border border-rule px-4 normal-case tracking-normal transition-colors duration-200 ease-editorial hover:border-ink"
        @click="downloadDemoCss"
      >
        Download demo CSS
      </button>
    </div>
  </div>
</template>
