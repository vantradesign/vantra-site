<script setup lang="ts">
import type { LayoutAIStore } from '~/composables/useLayoutAI'

const props = defineProps<{ ai: LayoutAIStore }>()

const emit = defineEmits<{ submit: [string]; accept: []; discard: [] }>()

const prompt = ref('')
const settingsOpen = ref(false)

const EXAMPLES = [
  'Three-column dashboard with a sidebar spanning two rows, a header across the top and a sticky footer',
  'Magazine spread: full-width kicker, a wide feature column and a narrow rail beside it',
  'A toolbar with a title that takes the slack and three controls that keep their size',
]

const statusLabel = computed(() => {
  switch (props.ai.status.value) {
    case 'checking':
      return 'Looking for a local model…'
    case 'ready':
      return `Connected — ${props.ai.provider.value?.label ?? 'local model'}`
    case 'unavailable':
      return 'No local model reachable'
    default:
      return 'Not checked yet'
  }
})

function onSubmit() {
  if (!props.ai.canSubmit.value) return
  emit('submit', prompt.value)
}
</script>

<template>
  <section aria-labelledby="ai-heading" class="border-t border-ink pt-6">
    <div class="flex flex-wrap items-baseline justify-between gap-4">
      <h2 id="ai-heading" class="caption">Describe it instead</h2>

      <div class="flex items-center gap-4">
        <p class="caption normal-case tracking-normal text-ink-muted" aria-live="polite">
          {{ statusLabel }}
        </p>
        <button
          type="button"
          class="caption min-h-11 border border-rule px-3 normal-case tracking-normal text-ink-muted transition-colors duration-200 ease-editorial hover:border-ink hover:text-ink"
          :aria-expanded="settingsOpen"
          aria-controls="ai-settings"
          @click="settingsOpen = !settingsOpen"
        >
          Model settings
        </button>
      </div>
    </div>

    <p class="mt-4 measure text-ink-muted">
      This talks to an
      <strong class="font-normal text-ink">Ollama running on your own machine</strong> and to nothing
      else. There is no key to paste and no hosted provider, because every other tool on this site
      promises that nothing leaves the browser and this one is not going to be the exception.
    </p>

    <div v-show="settingsOpen" id="ai-settings" class="mt-6 grid gap-8 sm:grid-cols-2">
      <ToolField
        v-model="props.ai.config.baseUrl"
        label="Ollama URL"
        hint="Default http://localhost:11434"
      />
      <ToolField v-model="props.ai.config.model" label="Model" hint="e.g. llama3.1:8b, qwen2.5-coder" />

      <div class="sm:col-span-2">
        <button
          type="button"
          class="caption min-h-11 border border-ink px-4 normal-case tracking-normal transition-colors duration-200 ease-editorial hover:border-blue hover:text-blue"
          @click="props.ai.checkAvailability()"
        >
          Test the connection
        </button>
      </div>
    </div>

    <form class="mt-8" @submit.prevent="onSubmit">
      <label for="ai-prompt" class="caption block">Describe your layout</label>
      <textarea
        id="ai-prompt"
        v-model="prompt"
        rows="3"
        :disabled="props.ai.pending.value"
        placeholder="3-column dashboard with a sidebar spanning two rows, a header across the top, and a sticky footer"
        class="mt-2 w-full resize-y border-b border-rule bg-transparent py-3 text-body text-ink outline-none transition-colors duration-200 ease-editorial placeholder:text-ink-faint focus:border-ink disabled:opacity-50"
      />

      <div class="mt-4 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          class="caption min-h-11 border border-ink bg-ink px-5 normal-case tracking-normal text-paper transition-colors duration-200 ease-editorial hover:bg-blue hover:border-blue disabled:opacity-50"
          :disabled="props.ai.pending.value || !prompt.trim()"
        >
          {{ props.ai.pending.value ? 'Generating…' : 'Generate layout' }}
        </button>

        <p class="caption normal-case tracking-normal text-ink-faint">
          The answer arrives as JSON and lands in the builder, so you can edit it afterwards.
        </p>
      </div>
    </form>

    <div class="mt-6">
      <p class="caption mb-3">Try one of these</p>
      <ul class="flex flex-col gap-2">
        <li v-for="example in EXAMPLES" :key="example">
          <button
            type="button"
            class="text-left text-[0.9375rem] leading-snug text-blue underline decoration-transparent underline-offset-4 transition-[text-decoration-color] duration-200 ease-editorial hover:decoration-blue"
            @click="prompt = example"
          >
            {{ example }}
          </button>
        </li>
      </ul>
    </div>

    <!-- Failure is a message, never a broken builder: the live state is untouched
         until Accept is pressed. -->
    <div v-if="props.ai.error.value" class="mt-6 border-t border-rule pt-4" role="alert">
      <p class="text-[0.9375rem] leading-snug text-fail">{{ props.ai.error.value }}</p>
      <p
        v-if="props.ai.status.value === 'unavailable'"
        class="mt-2 measure text-[0.9375rem] leading-snug text-ink-muted"
      >
        {{ props.ai.hint.value }}
      </p>
    </div>

    <div v-if="props.ai.suggestion.value" class="mt-6 border-t border-ink pt-4">
      <p class="caption">Suggestion</p>
      <p class="mt-3 measure text-ink">{{ props.ai.suggestion.value.explanation }}</p>

      <div class="mt-6 flex flex-wrap gap-4">
        <button
          type="button"
          class="caption min-h-11 border border-ink bg-ink px-5 normal-case tracking-normal text-paper transition-colors duration-200 ease-editorial hover:border-blue hover:bg-blue"
          @click="emit('accept')"
        >
          Accept — merge into the builder
        </button>
        <button
          type="button"
          class="caption min-h-11 border border-rule px-5 normal-case tracking-normal text-ink-muted transition-colors duration-200 ease-editorial hover:border-fail hover:text-fail"
          @click="emit('discard')"
        >
          Discard
        </button>
      </div>
    </div>
  </section>
</template>
