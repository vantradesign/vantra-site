<script setup lang="ts">
useToolPageSeo({
  slug: 'layout-builder',
  title: 'Grid & Flex Builder',
  // Trimmed to fit the ~160 characters a SERP snippet shows. The local-model
  // detail that used to be here is on the page itself, where it is not truncated.
  description:
    'Build a CSS grid or flex layout visually, including subgrid, and copy it as plain CSS or Tailwind v4 classes. Runs entirely in your browser.',
})
</script>

<template>
  <div>
    <ToolIntro
      kicker="Tools — 11"
      cover-line="A layout is an argument about what matters most."
      lead="Grid or flex is not a matter of taste: two dimensions want grid, one wants flex, and choosing wrongly is how a layout ends up held together by margins. Build it here in either model, keep the same items while you switch between them, and read the CSS that comes out. If it is easier to say than to draw, describe it — a model running on your own machine will draft it into the builder, where you can still edit every value by hand."
    />

    <GridFlexBuilder />

    <section aria-labelledby="honesty-heading" class="gutter mt-section">
      <div class="md:grid md:grid-cols-12 md:gap-x-8">
        <h2 id="honesty-heading" class="caption md:col-span-3">On the generated code</h2>
        <div class="md:col-span-6 md:col-start-5">
          <p class="measure text-ink-muted">
            Only properties that differ from their initial value are emitted. A generator that
            prints twelve declarations for a two-column grid teaches you nothing about which two
            mattered, and the extra lines are the ones that break later.
          </p>
          <p class="mt-6 measure text-ink-muted">
            The prompt field is off by default and talks only to an Ollama on
            <code class="font-mono">localhost</code>. There is no key to paste and no hosted model,
            because the rest of this set promises that nothing leaves your browser and one
            convenient exception is how that kind of promise dies.
          </p>
        </div>
      </div>
    </section>

    <ToolReference slug="layout-builder" />

    <ToolFooterNav slug="layout-builder" />
  </div>
</template>
