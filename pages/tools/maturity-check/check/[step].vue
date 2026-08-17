<script setup lang="ts">
usePageSeo({
  title: 'Design System Maturity Check',
  description:
    'A 24-question self-assessment across documentation, versioning, governance and adoption.',
  noindex: true,
  breadcrumb: [
    { name: 'Tools', path: '/tools' },
    { name: 'Design System Maturity Check', path: MC_BASE },
  ],
})

const route = useRoute()
const router = useRouter()

const { catalog, answered, total, answeredIn } = useMaturityInit()
const t = useMcT()
const m = useMcMessages()
const steps = useMcSteps()

const stepId = computed(() => route.params.step as string)

const step = computed(() => steps.find((s) => s.id === stepId.value))

const category = computed(() =>
  catalog.categories.find((c) => c.id === stepId.value),
)

/** Where the "Next" button goes: next category, or the result page. */
const nextTo = computed(() =>
  step.value?.next
    ? `${MC_BASE}/check/${step.value.next}`
    : `${MC_BASE}/result`,
)

/** Guard: redirect to first step if the step param is invalid. */
watch(
  stepId,
  (id) => {
    if (!catalog.categories.some((c) => c.id === id)) {
      router.replace(`${MC_BASE}/check/${catalog.categories[0]!.id}`)
    }
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="step && category">
    <McWizardProgress :current-index="step.index" />

    <section class="gutter py-10 md:py-14">
      <header class="mb-10 md:grid md:grid-cols-12 md:gap-x-8">
        <div class="md:col-span-8 md:col-start-5">
          <p class="caption">
            {{ m('stepOf', { number: step.number, total: step.of }) }}
          </p>
          <h1 class="mt-3 font-display text-display max-w-[20ch] text-balance">
            {{ t(category.name) }}
          </h1>
          <p class="mt-4 measure text-ink-muted">
            {{ t(category.description) }}
          </p>
          <p class="mt-2 text-ink-faint">{{ m('stepSkipNote') }}</p>
        </div>
      </header>

      <div class="md:grid md:grid-cols-12 md:gap-x-8">
        <div class="md:col-span-8 md:col-start-5 space-y-10">
          <McQuestionBlock
            v-for="(question, qi) in category.questions"
            :key="question.id"
            :question="question"
            :index="qi + 1"
          />
        </div>
      </div>

      <nav class="mt-14 md:grid md:grid-cols-12 md:gap-x-8">
        <div class="md:col-span-8 md:col-start-5 flex flex-wrap items-center gap-4">
          <NuxtLink
            v-if="step.previous"
            :to="`${MC_BASE}/check/${step.previous}`"
            class="btn btn-quiet"
          >
            {{ m('stepBack') }}
          </NuxtLink>

          <NuxtLink :to="nextTo" class="btn btn-solid">
            {{ step.next ? m('stepNext') : m('stepSeeResult') }}
          </NuxtLink>

          <span class="ml-auto text-caption normal-case tracking-normal text-ink-faint tabular-nums">
            {{ m('stepAnswered', { answered: answeredIn(category.id), total: category.questions.length }) }}
          </span>
        </div>
      </nav>
    </section>
  </div>
</template>
