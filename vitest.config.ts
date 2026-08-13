import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

/**
 * Two tiers, on purpose.
 *
 * `utils/` holds pure functions and runs in plain node — no DOM, no mounting,
 * fast. That is where the layout arithmetic and the drag state machine live, and
 * where most of the coverage should stay.
 *
 * `components/` runs in jsdom, and earns the cost by covering one thing nothing
 * else can: the wiring between a DOM event and an emit. A region that removes
 * itself from hit-testing mid-gesture never receives a `click`, so selection has
 * to hang off `pointerdown` — a rule no pure test can enforce, and one that broke
 * in exactly this way once already.
 *
 * jsdom has no layout engine, so it cannot prove the hit-testing itself. That
 * needs a real browser and is honestly out of scope for a unit suite.
 */
export default defineConfig({
  /*
   * The cast crosses a version skew, not a real incompatibility. Two Vites are in
   * the tree — Nuxt 3.21 resolves 7.x, while vitest 2 brings its own 5.x — so the
   * plugin is typed against one and `defineConfig` against the other. At runtime
   * vitest uses its own Vite 5, which is the major @vitejs/plugin-vue 5 targets,
   * and .vue files compile. Worth revisiting when vitest moves to Vite 7.
   *
   * Cast through `never` rather than Vite's own PluginOption, because Vite is not a
   * direct dependency here and importing its types would be a lie about the
   * dependency graph.
   */
  plugins: [vue() as never],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url)),
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['utils/**/*.test.ts', 'components/**/*.test.ts'],
    environmentMatchGlobs: [['components/**', 'jsdom']],
    setupFiles: ['./test/setup-auto-imports.ts'],
  },
})
