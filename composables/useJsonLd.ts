import type { SchemaNode } from '~/utils/schema'

/**
 * Emit one JSON-LD block for the page.
 *
 * Three decisions worth keeping:
 *
 * **One `@graph`, not one script per node.** Several `<script type="application/
 * ld+json">` blocks are legal and parsers merge them, but `@id` cross-references
 * between separate blocks are resolved less reliably by non-Google consumers —
 * and answer engines are non-Google consumers. A single graph makes
 * `{ "@id": "…#organization" }` unambiguous.
 *
 * **It survives the strict CSP.** `public/_headers` ships `script-src 'self'`
 * with build-time hashes, and an unhashed inline script would normally be
 * blocked. `application/ld+json` is a data block, never executed, so the browser
 * does not apply script-src to it — and `scripts/inject-csp-hashes.mjs` agrees:
 * its `isExecutable()` check returns false for any non-JS `type`, so these blocks
 * are correctly skipped rather than hashed. Do not change that function's type
 * allowlist without re-testing a deployed page for CSP violations.
 *
 * **`JSON.stringify`, not a template string.** Serialising by hand is how a stray
 * apostrophe in a summary becomes invalid JSON that every validator rejects
 * silently. Nuxt escapes the closing-tag sequence for us; the payload here is
 * first-party data with no user input.
 */
export function useJsonLd(nodes: SchemaNode[]) {
  if (!nodes.length) return

  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': nodes,
        }),
      },
    ],
  })
}
