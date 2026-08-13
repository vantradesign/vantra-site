<script setup lang="ts">
import { referenceForTool } from '~/data/tool-reference'
import { absoluteUrl } from '~/utils/site'
import { faqPageNode } from '~/utils/schema'

/**
 * The reference layer for a tool page: direct answer, question-led sections, an
 * optional comparison table, an FAQ, and the sources it is built from.
 *
 * Placement is deliberate. This sits *below* the working tool, not above it.
 * Someone who arrived to calculate a value gets the calculator first; someone who
 * arrived with a question — or a crawler assembling an answer — finds prose that
 * answers it without an interaction. Putting the explainer on top would push the
 * tool below the fold to serve a machine, which is the trade this layer exists to
 * avoid.
 *
 * Two structural guarantees:
 *
 * - **Nothing is hidden.** No accordion, no tabs, no "read more". Collapsed text
 *   is text an answer engine may treat as less prominent, and it is text a
 *   keyboard user has to open. The FAQ is a plain <dl>.
 * - **The visible answer and the schema answer are one string.** The FAQPage
 *   markup is generated from the same `faq` array the template renders, so they
 *   cannot drift. Markup that describes hidden or absent content is a
 *   structured-data spam violation; here it is structurally impossible.
 *
 * Renders nothing at all when the slug has no entry in `data/tool-reference.ts`,
 * so the file can be filled in tool by tool.
 */
const props = defineProps<{ slug: string }>()

const reference = computed(() => referenceForTool(props.slug))

/**
 * `FAQPage` is emitted here rather than from the page's `usePageSeo()` call
 * because this component owns the questions. The page passes its own nodes; this
 * one appends a second `@graph` block for the FAQ.
 *
 * Two JSON-LD blocks on one page is valid and parsers merge them. The alternative
 * — threading the FAQ data back up into every page's `usePageSeo()` call — would
 * put the same array in two places and invite exactly the drift the note above
 * says is impossible.
 */
const route = useRoute()

useJsonLd(
  reference.value?.faq.length
    ? [faqPageNode(absoluteUrl(route.path), reference.value.faq)]
    : [],
)
</script>

<template>
  <section
    v-if="reference"
    aria-labelledby="reference-heading"
    class="gutter mt-section border-t border-ink pt-8"
  >
    <h2 id="reference-heading" class="caption">Reference</h2>

    <!-- The answer block. Set at lead size and kept to a single paragraph: this
         is the passage most likely to be quoted, so it has to stand alone. -->
    <div class="mt-8 md:grid md:grid-cols-12 md:gap-x-8">
      <p class="md:col-span-8 text-lead measure text-ink">
        {{ reference.answer }}
      </p>
    </div>

    <div class="mt-16 md:grid md:grid-cols-12 md:gap-x-8">
      <div class="md:col-span-8 md:col-start-5 space-y-14">
        <section v-for="section in reference.sections" :key="section.heading">
          <h3 class="font-display text-title text-balance measure-tight">
            {{ section.heading }}
          </h3>
          <div class="mt-5 space-y-4">
            <p v-for="paragraph in section.body" :key="paragraph" class="measure text-ink-muted">
              {{ paragraph }}
            </p>
          </div>
        </section>
      </div>
    </div>

    <!-- Tables are full-width rather than sitting in the text column: they are
         reference material, and a four-column table in a 60ch measure is
         unreadable. Wrapped in a focusable scroll container so a keyboard user
         can reach the overflow on a narrow screen. -->
    <div v-if="reference.table" class="mt-20">
      <div
        class="overflow-x-auto"
        tabindex="0"
        role="region"
        :aria-label="reference.table.caption"
      >
        <table class="w-full border-collapse text-left">
          <caption class="caption mb-4 text-left normal-case tracking-normal measure">
            {{ reference.table.caption }}
          </caption>
          <thead>
            <tr class="border-y border-ink">
              <th
                v-for="column in reference.table.columns"
                :key="column"
                scope="col"
                class="caption py-3 pr-6 align-bottom text-ink"
              >
                {{ column }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, rowIndex) in reference.table.rows"
              :key="rowIndex"
              class="border-b border-rule"
            >
              <!-- First cell is a row header: it names the thing the rest of the
                   row describes, which is what lets a screen reader announce
                   "Heading, 32 to 64 pixels" before each value. -->
              <th scope="row" class="py-4 pr-6 align-top font-normal tabular-nums">
                {{ row[0] }}
              </th>
              <td
                v-for="(cell, cellIndex) in row.slice(1)"
                :key="cellIndex"
                class="py-4 pr-6 align-top tabular-nums text-ink-muted"
              >
                {{ cell }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="mt-20 md:grid md:grid-cols-12 md:gap-x-8">
      <h3 class="caption md:col-span-3">Common questions</h3>

      <dl class="md:col-span-8 md:col-start-5 mt-6 md:mt-0 border-t border-rule">
        <div
          v-for="item in reference.faq"
          :key="item.question"
          class="border-b border-rule py-6"
        >
          <dt class="font-display text-title measure-tight text-balance">{{ item.question }}</dt>
          <dd class="mt-3 measure text-ink-muted">{{ item.answer }}</dd>
        </div>
      </dl>
    </div>

    <div class="mt-16 md:grid md:grid-cols-12 md:gap-x-8">
      <h3 class="caption md:col-span-3">Sources</h3>

      <ul class="md:col-span-8 md:col-start-5 mt-6 md:mt-0 space-y-3">
        <li v-for="source in reference.sources" :key="source.href" class="measure">
          <AppLink :to="source.href" accent="blue">{{ source.label }}</AppLink>
        </li>
      </ul>
    </div>
  </section>
</template>
