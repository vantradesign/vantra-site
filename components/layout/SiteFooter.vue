<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="gutter border-t border-rule mt-section">
    <div class="grid gap-12 py-16 md:grid-cols-12">
      <div class="md:col-span-5">
        <p class="font-display text-title measure-tight">
          Open-source tools for the parts of a product nobody photographs.
        </p>
      </div>

      <div class="md:col-span-3 md:col-start-8">
        <h2 class="caption mb-4">Elsewhere</h2>
        <ul class="space-y-2">
          <li><AppLink to="https://github.com/vantradesign">GitHub</AppLink></li>
          <li><AppLink to="mailto:hello@vantra.design">hello@vantra.design</AppLink></li>
        </ul>
      </div>

      <div class="md:col-span-2">
        <h2 class="caption mb-4">Legal</h2>
        <ul class="space-y-2">
          <li><AppLink to="/privacy">Privacy</AppLink></li>
          <li><AppLink to="/imprint">Imprint</AppLink></li>
        </ul>
      </div>
    </div>

    <p class="caption pb-10">&copy; {{ year }} Vantra Design</p>
  </footer>
</template>
