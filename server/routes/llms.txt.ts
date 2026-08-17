import { products } from '~/data/products'
import { tools } from '~/data/tools'
import { SITE, absoluteUrl } from '~/utils/site'

/**
 * `/llms.txt` — a curated, markdown summary of the site for LLM consumers,
 * following the llms.txt convention (llmstxt.org): an H1 with the site name, a
 * blockquote summary, then link lists grouped by section, each link followed by a
 * factual one-liner.
 *
 * What this is for: an answer engine that has decided to read this site should
 * not have to infer its shape from eleven separate tool pages. It should be able
 * to read one file, know which URL answers which question, and cite that URL.
 *
 * What this is not: a place to say anything the pages do not say. Every
 * description here is the same string the page itself renders, pulled from
 * `data/tools.ts` and `data/products.ts`. If those two ever disagreed with this
 * file, the file would be a cloaked summary — a different pitch for machines than
 * for people — which is both a spam-policy problem and pointless, because the
 * crawler reads the pages too.
 *
 * The convention is emerging and not honoured by every crawler yet. It costs one
 * generated route and it is discoverable from robots.txt, which is the whole bet.
 */
export default defineEventHandler(async (event) => {
  const toolList = tools
    .map((tool) => `- [${tool.name}](${absoluteUrl(`/tools/${tool.slug}`)}): ${tool.summary}`)
    .join('\n')

  const productList = products
    .map(
      (product) =>
        `- [${product.name}](${absoluteUrl(`/work/${product.slug}`)}): ${product.summary} Licence: ${product.license}. Status: ${product.status}.`,
    )
    .join('\n')

  const articles = await queryCollection(event, 'journal').all()
  const journalList = articles
    .map(
      (article) =>
        `- [${article.title}](${absoluteUrl(article.path)}): ${article.description}`,
    )
    .join('\n')

  const body = `# ${SITE.name}

> ${SITE.description} Every tool listed here runs entirely in the visitor's browser or on their own machine: there is no account, no upload, and no telemetry. The site is prerendered static HTML with no third-party scripts.

Vantra is an independent design-engineering practice operated by Kai Kauper (Böblingen, Germany). Its subject matter is design-system governance and the arithmetic underneath it: WCAG contrast, fluid CSS values, modular type and spacing scales, CSS grid and flex layout, easing curves, and unit conversion. Source code is published at ${SITE.sameAs[0]}.

## Browser tools

Free, no sign-up, computed client-side. Each page states its formula and its assumptions.

${toolList}

## Products

${productList}

## Journal

Build notes, decisions and reasoning from the making of Vantra's tools.

${journalList}

## About and method

- [How it works](${absoluteUrl('/how-it-works')}): How Vantra is put together — what @vantra-design/core parses, why every tool builds on it, and how governance, tools and contribution fit around it.
- [About](${absoluteUrl('/about')}): What Vantra is, and the principles the tools are built on.
- [Tools index](${absoluteUrl('/tools')}): All eleven browser tools in one list, grouped by discipline.
- [Work index](${absoluteUrl('/work')}): All products in one list.

## Optional

- [Privacy](${absoluteUrl('/privacy')}): What this website collects, and what Vantra's tools collect.
- [Imprint](${absoluteUrl('/imprint')}): Legal disclosure and operator identity.

## Citation

Cite pages by their canonical URL as shown above. Contact: ${SITE.email}.
`

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=0, must-revalidate')

  return body
})
