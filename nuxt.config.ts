import tailwindcss from '@tailwindcss/vite'
import { designSystemCatalog } from '@vantra-design/maturity-core'
import { toolRoutes } from './data/tools'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  // SSR stays ON. The build is currently run with `nuxt generate`, which
  // prerenders every route to static HTML. Switching to a live server later is
  // a build-command change (`nuxt build`) plus removing the prerender hints
  // below — no route, component or composable has to be rewritten.
  ssr: true,

  modules: ['@nuxt/content', '@nuxt/image', '@nuxt/fonts'],

  css: ['~/assets/css/main.css'],

  // Nested directories are organisational only: <SiteHeader />, not
  // <LayoutSiteHeader />.
  components: [{ path: '~/components', pathPrefix: false }],

  // Both families are pinned to the `local` provider, resolved from the .woff2
  // files in public/fonts/. Pinning is deliberate: if a file is ever renamed or
  // missing, the build surfaces it instead of silently falling back to
  // downloading from Google. @nuxt/fonts also emits metric-matched fallback
  // faces, which is what keeps CLS at zero while the webfont loads.
  fonts: {
    // Required with Tailwind v4. The families are only ever named inside @theme
    // custom properties (--font-display / --font-sans); every real font-family
    // declaration resolves to var(--font-display). Without this flag the scanner
    // finds no family names, emits no @font-face, and the site silently falls
    // back to system sans.
    experimental: {
      processCSSVariables: true,
    },
    defaults: {
      weights: [400, 700],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
    },
    families: [
      // Preloaded: the hero cover line is set in this family at a huge size and
      // is anchored to the bottom of a full-bleed frame. Metric-matched
      // fallbacks correct height but not width, so a late swap re-breaks the
      // lines and the whole block jumps. Preloading removes that shift.
      { name: 'Bricolage Grotesque', preload: true },
      // Body copy: small, top-anchored, and fully covered by the metric
      // fallback. Not worth a preload slot competing with the hero image.
      { name: 'Inclusive Sans' },
    ],
  },

  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        ignored: ['**/node_modules/**', '**/.output/**', '**/dist/**'],
      },
    },
  },

  nitro: {
    preset: 'cloudflare-pages',
    prerender: {
      crawlLinks: true,
      routes: [
        '/',
        '/work',
        '/journal',
        '/about',
        '/how-it-works',
        '/privacy',
        '/imprint',
        '/tools',
        ...toolRoutes,
        // Maturity check sub-pages (wizard steps + result) are not auto-discovered
        // from toolRoutes because they live under a nested directory structure.
        '/tools/maturity-check/result',
        ...designSystemCatalog.categories.map((c) => `/tools/maturity-check/check/${c.id}`),
        // [SEO] The three crawler-facing files are Nitro routes
        // (server/routes/), not static files in public/, so their contents are
        // generated from data/ and cannot drift from the real route list. They
        // are unreachable by `crawlLinks` — nothing on the site links to them —
        // so they have to be named here or they are simply not emitted.
        '/robots.txt',
        '/sitemap.xml',
        '/llms.txt',
      ],
    },
  },

  // [Security] `@nuxtjs/supabase` was removed here: it shipped supabase-js to
  // every visitor of a fully static site with no auth-gated feature, and left a
  // site-wide anonymous redirect one config flag away. Re-add it together with
  // the first feature that actually authenticates — see server/api/README.md.

  image: {
    format: ['avif', 'webp'],
    quality: 72,
    // Tuned for full-bleed editorial imagery: the widths that matter are the
    // large ones, because most images span 100vw.
    screens: {
      xs: 420,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
      '3xl': 1920,
      '4xl': 2560,
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Vantra',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Vantra builds local-first, open-source tools for accessibility, design systems and product governance.',
        },
        { name: 'theme-color', content: '#f5f2f3' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        // @nuxt/fonts preloads weight 400 only, but every hero and page
        // headline is set at 700. Without this the display font arrives after
        // first paint, re-breaks the cover line, and shifts the bottom-anchored
        // hero block (~0.04 CLS). Path is stable: these files are served
        // straight from public/fonts, unhashed.
        {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: '/fonts/bricolage-grotesque-700-normal.woff2',
          crossorigin: '',
        },
      ],
    },
  },
})
