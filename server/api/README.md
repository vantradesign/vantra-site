# `server/api/`

Intentionally empty. This is the future home of Supabase-backed Nitro routes.

Nothing here ships in the current phase — the site is prerendered and has no
server-side behaviour. The directory exists so that adding accounts and payments
is a feature addition rather than a re-architecture.

Planned occupants, in the order they will likely be needed:

| Route | Purpose |
| --- | --- |
| `auth/callback.ts` | Exchanges the Supabase OAuth/magic-link code for a session cookie. |
| `stripe/webhook.post.ts` | Verifies the Stripe signature and writes subscription state to Supabase. Must read the **raw** body. |
| `entitlements.get.ts` | Returns what the current user may access, read from Supabase with RLS applied. |
| `checkout.post.ts` | Creates a Stripe Checkout session for the authenticated user. |

Rules for anything added here:

- **Service-role keys are server-only.** Use `useRuntimeConfig()` (private keys,
  no `public.` prefix). Never import them into a component.
- **Authorisation belongs in the database.** Prefer Supabase row-level security
  over checks written in a route handler.
- **Adding the first route means leaving full static generation.** Switch the
  build from `nuxt generate` to `nuxt build` and mark the still-static pages with
  `routeRules`. No page or component has to change: `ssr: true` is already set.
