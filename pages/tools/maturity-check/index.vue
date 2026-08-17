<script setup lang="ts">
useToolPageSeo({
  slug: 'maturity-check',
  title: 'Design System Maturity Check',
  description:
    'A 24-question self-assessment across documentation, versioning, governance and adoption. Scores four dimensions and returns next steps for the level you reached. Runs entirely in the browser.',
})

const { catalog, answered, total } = useMaturityInit()

const t = useMcT()
const m = useMcMessages()

const hasProgress = computed(() => answered.value > 0)
const firstStep = computed(() => catalog.categories[0]!.id)
</script>

<template>
  <div>
    <ToolIntro
      kicker="Tools — 19"
      cover-line="A score is a starting point, not a verdict."
      lead="Twenty-four questions across four dimensions — documentation, versioning, governance, adoption — scored against published maturity models. The result is a snapshot of where your design system is today and three next steps for each dimension. Nothing leaves the browser."
    >
      <div class="mt-10 flex items-center gap-6">
        <McLocaleToggle />
      </div>
    </ToolIntro>

    <section aria-labelledby="start-heading" class="gutter mt-20 md:mt-28">
      <h2 id="start-heading" class="sr-only">Start the assessment</h2>

      <div class="md:grid md:grid-cols-12 md:gap-x-8">
        <div class="md:col-span-6 md:col-start-5">
          <p class="text-lead measure text-ink-muted">
            {{ t(catalog.description) }}
          </p>

          <p class="mt-4 text-ink-faint">
            {{ m('introQuestionCount', { count: total }) }}
          </p>

          <div class="mt-8 flex flex-wrap gap-4">
            <NuxtLink
              :to="`${MC_BASE}/check/${firstStep}`"
              class="btn btn-solid"
            >
              {{ hasProgress ? m('introContinue') : m('introStart') }}
            </NuxtLink>

            <NuxtLink
              v-if="hasProgress"
              :to="`${MC_BASE}/result`"
              class="btn btn-quiet"
            >
              {{ m('stepSkipToResult') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <ToolReference slug="maturity-check" />

    <ToolFooterNav slug="maturity-check" />
  </div>
</template>
