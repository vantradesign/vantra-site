# Notice — what the licence does and does not cover

`LICENSE` is a standard MIT licence. It applies to the **source code** of this
repository: components, composables, utilities, configuration and build setup.
Take it, change it, ship it.

It does **not** apply to the content, which is reserved.

## Covered by MIT

- `components/`, `composables/`, `utils/`, `pages/`, `server/` — the code itself
- `assets/css/`, `nuxt.config.ts`, `tsconfig.json`, `package.json`
- The `/tools` implementations, including the colour, scale and easing maths

## Reserved — © 2026 Vantra Design, all rights reserved

- **Editorial copy.** Cover lines, standfirsts, manifesto statements, product
  descriptions and journal entries, wherever they appear — including the strings
  embedded in `pages/`, `data/products.ts` and `data/tools.ts`.
- **Imagery.** Everything under `public/editorial/` and `public/media/`, together
  with the generation prompts recorded in the two `MANIFEST.md` files.
- **Brand.** The Vantra and Vantra Design names, the wordmark and
  `public/favicon.svg`.

Reusing the code to build your own site is the intended case, and it is
explicitly fine. Republishing the writing or the imagery, or presenting a site as
Vantra, is not.

This mirrors the licensing paragraph on the site's own imprint page.

## Third-party components

Fonts are not ours and are not covered by either of the above:

| Asset | Licence |
| --- | --- |
| Bricolage Grotesque, Inclusive Sans (`public/fonts/`) | SIL Open Font License 1.1 |
| `@fontsource/*` faces used by `/tools/font-pairing` | SIL Open Font License 1.1 |

npm dependencies carry their own licences; see `pnpm-lock.yaml`.

## Products are licensed separately

The Vantra tools documented under `/work` — the Accessibility Auto-Fixer, the
governance suite and the rest — live in their own repositories and each states
its own licence. Nothing here changes those terms.
