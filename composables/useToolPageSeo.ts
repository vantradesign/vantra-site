import { toolBySlug } from '~/data/tools'
import { referenceForTool } from '~/data/tool-reference'
import { webApplicationNode } from '~/utils/schema'
import { absoluteUrl } from '~/utils/site'

/**
 * SEO for a `/tools/[slug]` page. Wraps `usePageSeo()` and derives everything a
 * tool page adds on top of a plain page: the Tools breadcrumb, the
 * `WebApplication` node, and the tool's name from `data/tools.ts`.
 *
 * The point is that a tool page passes only what is genuinely its own — a title
 * and a description — and cannot forget the breadcrumb or get the application
 * category wrong, because neither is typed by hand at the call site.
 *
 * The name in the schema comes from `data/tools.ts`, not from the page's `title`
 * argument, so the entity name matches the name printed in the tools index and in
 * llms.txt. Three different spellings of one tool across three surfaces is how an
 * entity gets split in two.
 */

/**
 * schema.org `applicationCategory`, chosen per discipline.
 *
 * Both values used here are ones Google documents for software listings. The
 * split is honest rather than cosmetic: the colour and type tools produce design
 * decisions, while the unit, layout and motion tools emit code you paste into a
 * stylesheet.
 */
const CATEGORY_BY_DISCIPLINE = {
  Colour: 'DesignApplication',
  Type: 'DesignApplication',
  Layout: 'DeveloperApplication',
  Motion: 'DeveloperApplication',
  Units: 'DeveloperApplication',
  Governance: 'DesignApplication',
  Assets: 'DesignApplication',
  Content: 'DesignApplication',
  Accessibility: 'DesignApplication',
} as const

export function useToolPageSeo(options: {
  slug: string
  title: string
  description: string
}) {
  const tool = toolBySlug(options.slug)

  if (!tool) {
    // A slug with no entry in data/tools.ts would silently ship a page with no
    // breadcrumb and no schema. Failing here surfaces it during `nuxt generate`,
    // which is the only moment it is cheap to fix.
    throw createError({
      statusCode: 500,
      statusMessage: `useToolPageSeo: no tool in data/tools.ts for slug "${options.slug}"`,
      fatal: true,
    })
  }

  const path = `/tools/${tool.slug}`

  /**
   * `featureList` is populated from the reference section headings — the
   * questions the page actually answers. It is the one place a feature list is
   * defensible, because every entry corresponds to a visible <h3>.
   */
  const featureList = referenceForTool(tool.slug)?.sections.map((section) => section.heading)

  usePageSeo({
    title: options.title,
    description: options.description,
    breadcrumb: [
      { name: 'Tools', path: '/tools' },
      { name: tool.name, path },
    ],
    schema: [
      webApplicationNode({
        url: absoluteUrl(path),
        name: tool.name,
        description: tool.summary,
        category: CATEGORY_BY_DISCIPLINE[tool.discipline],
        featureList,
      }),
    ],
  })
}
