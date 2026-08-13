<script setup lang="ts">
/**
 * `ContactPage`, because this is the page that carries the operator's identity and
 * contact details. It is also the visible source for the `address` and `email`
 * fields in the `Organization` and `Person` nodes — those exist in the markup only
 * because they are printed here.
 */
usePageSeo({
  title: 'Imprint',
  description: 'Legal disclosure for vantra.design.',
  pageType: 'ContactPage',
  breadcrumb: [{ name: 'Imprint', path: '/imprint' }],
})
</script>

<template>
  <div class="gutter pt-16 md:pt-24">
    <p class="caption">Imprint</p>
    <h1 class="mt-8 font-display text-display font-bold max-w-[24ch] text-balance">
      Legal disclosure.
    </h1>

    <div class="mt-14 md:grid md:grid-cols-12">
      <div class="md:col-span-8 md:col-start-5 space-y-10">
        <!-- Placeholder: complete before launch. § 5 DDG / § 18 MStV require a
             real name and address for a German operator. -->
        <section>
          <h2 class="caption">Responsible for content</h2>
          <p class="mt-4 measure text-ink-muted">
            Kai Kauper<br />
            Humboldtstr. 3<br />
            71032 Böblingen<br />
            Germany
          </p>
        </section>

        <section>
          <h2 class="caption">Contact</h2>
          <p class="mt-4">
            <AppLink to="mailto:hello@vantra.design">hello@vantra.design</AppLink>
          </p>
        </section>

        <section>
          <h2 class="caption">Licensing</h2>
          <p class="mt-4 measure text-ink-muted">
            Each tool is licensed individually; the licence is stated on its page. The source code
            of this site is MIT-licensed. Site copy and imagery are © Vantra Design unless noted
            otherwise.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>
