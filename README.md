# vantra.design

The Vantra product site. Editorial in tone, static in delivery, structured so
that accounts and payments can be added later without a rewrite.

Nuxt 3 · TypeScript · Tailwind CSS v4 · `@nuxt/image` · `@nuxt/fonts` ·
`@nuxtjs/supabase` (dormant)

---

## Running it

```bash
pnpm install
cp .env.example .env     # placeholder Supabase values are fine
pnpm dev                 # http://localhost:3000
```

| Script | Purpose |
| --- | --- |
| `pnpm dev` | Dev server. |
| `pnpm generate` | Prerender the whole site to `.output/public`. This is the production build today. |
| `pnpm preview` | Serve the built output. |
| `pnpm tsc` | `vue-tsc --noEmit`. Use this, not `npx tsc`. |

---

## Art direction, in one screen

The site should read as a magazine, not a SaaS landing page.

- **Type.** Bricolage Grotesque for display, Inclusive Sans for body and UI.
  Six type steps, no more. Headlines are cover lines — sentence case, ending in a
  full stop, under 22 characters per line.
- **Colour.** Paper `#f5f2f3` and ink `#001619` carry ~95% of every screen. One
  accent per composition: blue `#021f94` for structure and links, cyan `#50e8f4`
  for interaction and the accessibility product's own overlay language, cyan-soft
  `#c7f8fe` only as a large flat field. Never two accents in one section.
- **Grid.** 12 columns, used asymmetrically — text usually sits on columns 5–12,
  rarely centred, never full width. Outer margin is the `gutter` utility.
- **Rhythm.** `mt-section` (`clamp(6rem, 13vw, 12.5rem)`) between sections. Never
  two same-typed sections adjacent: image, then text, then image, then pull-quote.
- **Motion.** Opacity plus a 12px rise, 600ms, once, via `useScrollReveal`. No
  parallax, no scale, no bounce. Everything is disabled under
  `prefers-reduced-motion`.

### Fonts are self-hosted

`@nuxt/fonts` downloads Bricolage Grotesque and Inclusive Sans at build time, so
no request goes to Google at runtime. To move to licensed files, drop the
`.woff2` files into `public/fonts/` using the family name as the filename — the
`local` provider is resolved before `google` and takes over automatically. No
config change, no `@font-face` block to write.

### Design tokens

Tokens live in `assets/css/main.css` under `@theme`, authored as CSS custom
properties. That is deliberate: `parseTokenSchema()` from `@vantra-design/core`
can read them, so this site is governable by Vantra's own tooling.

---

## The two image systems

Keeping these apart is the whole art direction. Do not blur them.

| | AI-generated (mood) | Real product media |
| --- | --- | --- |
| Lives in | `public/editorial/` | `public/media/<slug>/` |
| Appears on | `/`, `/work`, `/about` | `/work/[slug]` only |
| Rendered by | `MoodImage.vue` (via `FullBleedHero`, `WorkEntry`, `EditorialSection`) | `ProductMediaBlock.vue` (via `ProductHero`) |
| Purpose | Atmosphere and brand framing — a real screenshot composited into a studio scene | Proof — the actual UI, unretouched |
| Convention | `public/editorial/MANIFEST.md` | `public/media/MANIFEST.md` |

**The generation convention is not optional.** Every mood image is produced from
the locked prompt template in `public/editorial/MANIFEST.md`, where only the
subject and scene clauses vary — lighting, lens, grade and palette are fixed so
that the series reads as one continuous shoot. Every generated file is registered
there with its prompt.

**Missing assets stay visibly missing.** An unresolved mood image renders a dark
marked frame; an unresolved capture renders a dashed frame at the correct aspect
ratio. Both carry the intended alt text. Neither is ever substituted with a
generated approximation of real UI.

### Accessibility of imagery

Mood images are decorative in feeling but informative in content — they show real
product state — so they carry meaningful alt text, never `alt=""`. Product video
autoplays muted and looped, and under `prefers-reduced-motion` renders as its
poster frame with native controls, so the visitor can still choose to play it.

---

## Adding a new Work entry

1. Append a `Product` object to `data/products.ts`.
2. Generate the mood image per the manifest template; register it.
3. Record the real captures; register them in `public/media/MANIFEST.md`.
4. Done. `/work/[slug]` and both indexes pick it up — no new components, and
   `crawlLinks` prerenders the route automatically.

---

## Rendering, now and later

`ssr: true` is already set. The production build simply runs `nuxt generate`,
which prerenders every route.

To move to a live server later:

1. Change the build command to `nuxt build`.
2. Remove the `nitro.prerender` block, or keep the marketing pages static with
   `routeRules`.

Nothing else changes. Page data is read through `useAsyncData` rather than at
module scope, and no data fetching is client-only, so components behave
identically under SSR.

---

## Supabase

`@nuxtjs/supabase` is installed and configured now, and deliberately does
nothing yet.

- `SUPABASE_URL` and `SUPABASE_KEY` are required from day one — the module fails
  at startup without them. Placeholder values are fine while no feature calls
  Supabase.
- `supabase: { redirect: false }` in `nuxt.config.ts` is **required**. The module
  otherwise installs a global middleware that redirects anonymous visitors to
  `/login`, which would break every public page.
- `server/api/` is scaffolded and documented but empty. See
  `server/api/README.md` for the routes it is reserved for.

### Adding accounts and payments

No separate auth provider is needed, and no restructuring:

1. **Auth.** Supabase handles sign-in. Use `useSupabaseUser()` in components and
   re-enable `redirect` (or add per-route middleware) for the pages that need
   gating. Public editorial pages stay untouched.
2. **State.** User and subscription records live in Supabase, protected by
   row-level security, so entitlement checks are a query rather than
   application logic.
3. **Payments.** Stripe Checkout for the purchase, and a Nitro route at
   `server/api/stripe/webhook.post.ts` for webhooks — it verifies the Stripe
   signature against the **raw** request body and writes subscription state into
   Supabase. Service-role keys stay server-side via `useRuntimeConfig()`.
4. **Build.** The first server route means switching from `nuxt generate` to
   `nuxt build` and keeping the editorial pages static via `routeRules`.

This is why the stack is Nuxt rather than a purely static generator: step 3 needs
a server, and Nitro is already there.

---

## Deployment

Cloudflare Pages or Vercel, custom domain `vantra.design`, HTTPS, preview
deployments per pull request.

- Build command: `pnpm generate`
- Output directory: `.output/public`
- Environment variables: `SUPABASE_URL`, `SUPABASE_KEY`

### Performance budget

The layout is image-heavy on purpose, so the budget is enforced rather than
assumed. Target LCP < 2.5s, CLS < 0.1.

- Exactly one image per page is `priority` (eager + preloaded): the opening
  spread on `/`, the hero capture on a product page. Everything else is lazy.
- AVIF and WebP only, `quality: 72`, with `sizes` declared on every image.
- Video is `preload="none"` below the fold and carries a poster.
- Every media frame declares its aspect ratio, so late-arriving assets cannot
  shift layout.
- No web font is render-blocking; fonts are self-hosted and subset by
  `@nuxt/fonts`.

---

## License

Site code © Vantra Design. Each tool is licensed individually — see its page.
