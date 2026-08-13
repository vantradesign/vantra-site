/**
 * The reference layer: a factual register that sits below each tool's widget.
 *
 * Why this is a separate content type and not more editorial prose. The site's
 * art direction (README § Art direction) is magazine voice — cover lines, no
 * bullet lists, atmosphere before mechanism. That voice is very good at making
 * someone want to use a tool and very bad at answering "what is the CSS clamp()
 * formula", which is the question people actually type. Both registers are
 * legitimate; mixing them in one block produces neither.
 *
 * So the editorial layer keeps the top of the page (ToolIntro), and this layer
 * takes the bottom: direct answer first, one question per heading, short
 * paragraphs, a table where the content is genuinely tabular, and a short FAQ.
 * That structure is also what an answer engine can extract a citation from —
 * `ToolReference.vue` emits the same Q&A as `FAQPage` JSON-LD, so the markup and
 * the visible text are the same sentences by construction.
 *
 * Content rules for anything added here:
 *
 * - Answer the question in the first sentence. No preamble, no "in this article".
 * - Two to three sentences per paragraph. A section is one topic.
 * - Every number must be traceable to the tool's own implementation in
 *   `utils/tools/`. If the page says the ramp holds hue and re-anchors lightness,
 *   `generateRamp()` has to actually do that.
 * - Sources are real, primary and checkable: MDN, the W3C specification, the
 *   WCAG understanding documents. No blog posts, no invented statistics, and
 *   nothing paraphrased from a source that was not read.
 */

/** A question and its answer, rendered visibly and mirrored into FAQPage schema. */
export interface ReferenceFaq {
  question: string
  answer: string
}

/** A prose section. `heading` is phrased as the question a person would ask. */
export interface ReferenceSection {
  heading: string
  /** Two-to-three-sentence paragraphs, answer first. */
  body: string[]
}

/**
 * A comparison table. Present because models reliably extract tabular
 * relationships and reliably mangle the same information written as prose.
 */
export interface ReferenceTable {
  /** Describes the table for screen readers and for a model reading the caption. */
  caption: string
  columns: string[]
  rows: string[][]
}

export interface ReferenceSource {
  label: string
  href: string
}

export interface ToolReferenceEntry {
  /** Matches a `slug` in `data/tools.ts`. */
  slug: string
  /**
   * The extractable answer. One or two sentences, self-contained enough to be
   * quoted with no surrounding context, because that is how it will be quoted.
   * Kept under about 45 words: longer blocks get truncated mid-clause.
   */
  answer: string
  sections: ReferenceSection[]
  table?: ReferenceTable
  faq: ReferenceFaq[]
  sources: ReferenceSource[]
}
