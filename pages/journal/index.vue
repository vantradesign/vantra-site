<script setup lang="ts">
/**
 * `noindex` until the journal has entries.
 *
 * Today this page's entire content is a promise that it will have content later.
 * Indexed, it is thin content, and thin content is weighed against the whole site
 * rather than just the URL it sits on. `follow` is kept so the GitHub link still
 * passes, and the page stays reachable from the header for anyone who clicks it.
 *
 * Remove this flag and the `/journal` entry in `EXCLUDED_FROM_SITEMAP`
 * (`data/routes.ts`) in the same commit as the first published entry.
 */
usePageSeo({
  title: 'Journal',
  description: 'Build notes from the making of Vantra’s tools.',
  breadcrumb: [{ name: 'Journal', path: '/journal' }],
  noindex: true,
})
</script>

<template>
  <div>
    <section class="gutter pt-16 md:pt-24">
      <p class="caption">Journal</p>
      <h1 class="mt-8 font-display text-cover max-w-[22ch] text-balance">
        Notes from the making, published when there is something worth reading.
      </h1>
      <p class="mt-10 measure text-ink-muted">
        The journal opens with the first release. It will carry build notes, decisions we regretted,
        and the reasoning behind the parts of the tooling that look strange from the outside.
      </p>
      <p class="mt-8">
        <AppLink to="https://github.com/vantradesign" accent="blue">
          Follow the work on GitHub in the meantime
        </AppLink>
      </p>
    </section>
  </div>
</template>
