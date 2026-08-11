<script setup lang="ts">
/**
 * Chapter two's visual: an editorial dependency drawing. Set in type and rules
 * rather than SVG boxes, so it reads as a spread element and stays legible to a
 * screen reader as what it is — a list of consumers and what each one takes.
 */
const consumers = [
  {
    name: 'Accessibility Auto-Fixer',
    takes: 'the token schema, to name the nearest passing colour you already own',
    to: '/work/accessibility-auto-fixer',
  },
  {
    name: 'AI Design Reviewer',
    takes: 'the component graph, to tell drift from a deliberate variant',
    to: '/work/ai-design-reviewer',
  },
  {
    name: 'Deprecation Lifecycle Orchestrator',
    takes: 'the same graph, to answer who breaks if this is removed today',
    to: '/work/deprecation-lifecycle-orchestrator',
  },
  {
    name: 'Governance Suite',
    takes: 'the parsed inventory, to score health without a second opinion of your code',
    to: 'https://github.com/vantradesign',
  },
]

const root = ref<HTMLElement | null>(null)
useScrollReveal(root)
</script>

<template>
  <figure ref="root" class="gutter mt-16">
    <div class="md:grid md:grid-cols-12 md:gap-x-8">
      <div class="md:col-span-3">
        <p class="caption">Reads once</p>
        <p class="mt-3 font-mono text-[0.9375rem] leading-relaxed">@vantra-design/core</p>
        <p class="mt-4 measure text-ink-muted">
          Token schema, component graph, dependency edges, ownership.
        </p>
      </div>

      <!-- The rule is the drawing: one spine, four branches. -->
      <ul class="mt-10 border-l border-ink md:col-span-8 md:col-start-5 md:mt-0">
        <li
          v-for="consumer in consumers"
          :key="consumer.name"
          class="relative py-6 pl-8 first:pt-0 last:pb-0"
        >
          <span class="absolute left-0 top-9 h-px w-6 bg-ink first:top-3" aria-hidden="true" />
          <p class="font-display text-title">
            <AppLink :to="consumer.to">{{ consumer.name }}</AppLink>
          </p>
          <p class="mt-2 measure text-ink-muted">Takes {{ consumer.takes }}.</p>
        </li>
      </ul>
    </div>

    <figcaption class="pt-8">
      <EditorialCaption
        index="Fig. 02"
        text="Four consumers, one reading of the repository. The parser runs once; nothing downstream is allowed a second opinion about what your system contains."
      />
    </figcaption>
  </figure>
</template>
