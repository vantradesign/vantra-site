<template>
  <div class="min-h-screen bg-paper text-ink flex flex-col">
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-ink focus:text-paper focus:px-4 focus:py-2"
    >
      Skip to content
    </a>

    <SiteHeader />

    <main id="main" aria-label="Content" class="flex-1">
      <slot />
    </main>

    <SiteFooter />

    <ToastHost />
  </div>
</template>
