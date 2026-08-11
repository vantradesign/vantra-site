import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  // SSR stays ON. The build is currently run with `nuxt generate`, which
  // prerenders every route to static HTML. Switching to a live server later is
  // a build-command change (`nuxt build`) plus removing the prerender hints
  // below — no route, component or composable has to be rewritten.
  ssr: true,

  modules: ['@nuxt/image', '@nuxt/fonts', '@nuxtjs/supabase'],

  css: ['~/assets/css/main.css'],

  // Nested directories are organisational only: <SiteHeader />, not
  // <LayoutSiteHeader />.
  components: [{ path: '~/components', pathPrefix: false }],

  vite: {
    plugins: [tailwindcss()],
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/work', '/journal', '/about', '/privacy', '/imprint'],
    },
  },

  // Dormant for this phase. `redirect: false` is required: the module would
  // otherwise install a global middleware that redirects anonymous visitors to
  // /login, which would break every public page. See README § Supabase.
  supabase: {
    redirect: false,
  },

  fonts: {
    // @nuxt/fonts downloads and self-hosts these at build time, so there is no
    // request to fonts.googleapis.com at runtime. To swap in licensed local
    // files later, drop the .woff2 files into `public/fonts/` — the `local`
    // provider is checked before `google` and wins automatically.
    defaults: {
      weights: [400, 500, 700],
      styles: ['normal', 'italic'],
    },
    families: [
      { name: 'Bricolage Grotesque', provider: 'google' },
      { name: 'Inclusive Sans', provider: 'google' },
    ],
  },

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
      link: [{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    },
  },
})
