<script setup lang="ts">
useSeoMeta({
  title: 'Imprint',
  description: 'Legal disclosure for vantra.design.',
})
</script>

<template>
  <div class="gutter pt-16 md:pt-24">
    <p class="caption">Imprint</p>
    <h1 class="mt-8 font-display text-display max-w-[24ch] text-balance">
      Legal disclosure.
    </h1>

    <div class="mt-14 md:grid md:grid-cols-12">
      <div class="md:col-span-8 md:col-start-5 space-y-10">
        <!-- Placeholder: complete before launch. § 5 DDG / § 18 MStV require a
             real name and address for a German operator. -->
        <section>
          <h2 class="caption">Responsible for content</h2>
          <p class="mt-4 measure text-ink-muted">
            [Full name]<br />
            [Street and number]<br />
            [Postal code and city]<br />
            [Country]
          </p>
        </section>

        <section>
          <h2 class="caption">Contact</h2>
          <p class="mt-4">
            <AppLink to="mailto:hello@vantra.design">hello@vantra.design</AppLink>
          </p>
        </section>

        <section>
          <h2 class="caption">VAT identification number</h2>
          <p class="mt-4 measure text-ink-muted">[If applicable]</p>
        </section>

        <section>
          <h2 class="caption">Licensing</h2>
          <p class="mt-4 measure text-ink-muted">
            Each tool is licensed individually; the licence is stated on its page. Site copy and
            imagery are © Vantra Design unless noted otherwise.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>
