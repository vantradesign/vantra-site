/**
 * The five chapters of /how-it-works.
 *
 * Shared by the contents page, the sticky register and the section headings so
 * the three can never drift apart. Prose lives in the page template, not here:
 * this file holds only what has to be repeated in more than one place.
 */
export interface Chapter {
  /** Anchor target. Also the id of the <section>. */
  id: string
  /** Ordered label, magazine style. */
  index: string
  /** Register and heading title. Short enough for the mobile chip rail. */
  title: string
  /** One line for the contents page. Not a description of the chapter — a reason to read it. */
  teaser: string
}

export const chapters: Chapter[] = [
  {
    id: 'what-vantra-is',
    index: '01',
    title: 'What Vantra is',
    teaser: 'Not a suite, not a platform. A set of instruments that share one reading of your code.',
  },
  {
    id: 'the-core',
    index: '02',
    title: 'The core',
    teaser: 'What @vantra-design/core parses, and why every other tool refuses to guess without it.',
  },
  {
    id: 'the-tools',
    index: '03',
    title: 'The tools',
    teaser: 'Eleven small utilities and four larger products, and how to tell which one you need.',
  },
  {
    id: 'governance',
    index: '04',
    title: 'Governance as posture',
    teaser: 'Deprecation, versioning and ownership treated as craft rather than paperwork.',
  },
  {
    id: 'taking-part',
    index: '05',
    title: 'Taking part',
    teaser: 'Where the source is, what is unfinished, and the kind of help that actually helps.',
  },
]

export const chapterIds = chapters.map((chapter) => chapter.id)
