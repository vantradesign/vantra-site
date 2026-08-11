<script setup lang="ts">
useSeoMeta({
  title: 'Privacy',
  description: 'What this website collects, and what Vantra’s tools collect.',
})
</script>

<template>
  <div class="gutter pt-16 md:pt-24">
    <p class="caption">Privacy</p>
    <h1 class="mt-8 font-display text-display max-w-[24ch] text-balance">
      This site collects nothing, and neither do the tools.
    </h1>

    <div class="mt-14 md:grid md:grid-cols-12">
      <div class="md:col-span-8 md:col-start-5 space-y-10">
        <section>
          <h2 class="caption">This website</h2>
          <p class="mt-4 measure text-ink-muted">
            Static pages, served without analytics, tracking pixels, advertising identifiers or
            third-party cookies. Fonts are self-hosted, so no request leaves for a font CDN. Server
            access logs may be kept by the hosting provider for operational security; they are not
            used to profile visitors.
          </p>
        </section>

        <section>
          <h2 class="caption">The tools</h2>
          <p class="mt-4 measure text-ink-muted">
            Vantra’s tools run locally. Page content, URLs, screenshots, source code and findings are
            not transmitted to us or to anyone else. There is no account and no telemetry.
          </p>
        </section>

        <section>
          <h2 class="caption">If that changes</h2>
          <p class="mt-4 measure text-ink-muted">
            Should accounts or paid features be introduced, this page will state exactly what is
            stored, where, and for how long — before the feature ships, not after.
          </p>
        </section>

        <section>
          <h2 class="caption">Contact</h2>
          <p class="mt-4">
            <AppLink to="mailto:hello@vantra.design">hello@vantra.design</AppLink>
          </p>
        </section>
      </div>
    </div>
  </div>
</template>
