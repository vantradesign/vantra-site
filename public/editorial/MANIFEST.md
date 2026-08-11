# Editorial imagery — AI-generated (mood)

Every file in this directory is registered below **with the prompt that produced
it**. This is what keeps the series coherent: entry 07 must look like it was shot
on the same afternoon as entry 01.

Never use these on `/work/[slug]` pages. Product pages use real captures only
(see `public/media/MANIFEST.md`).

## The locked prompt template

Vary only the `SUBJECT` and `SCENE` clauses. Everything after them is fixed.

```
SUBJECT: <the real product surface visible in the scene, e.g. "an open laptop
  showing a browser with three contrast-failure markers on a live page">
SCENE: <the interior, e.g. "a corner of a working studio, raw plaster wall, pale
  oak worktop, a folded linen cloth">

--- fixed from here ---
Editorial still-life photograph for a design magazine. Late-morning daylight from
a single large window at frame left, roughly 4200K, soft but directional, long
quiet shadows. Matte finish, low saturation, lifted blacks, cool-neutral grade.
Palette restricted to paper white (#f5f2f3), deep ink (#001619) and raw material
tones; exactly one saturated accent object in cyan (#50e8f4) or blue (#021f94),
small in frame. Shot on a 50mm prime at f/4, eye-level or slightly above,
no tilt. Generous negative space in the upper third for a headline. No people,
no hands, no text overlays, no logos, no lens flare, no bokeh balls, no gradient
backgrounds, no glossy reflections, no clutter.
```

## Rules

1. **The screen content must be real.** Generate the scene, then composite the
   actual product screenshot into the screen in post. Never let the model
   invent UI — an invented interface in a mood shot is a lie about the product.
2. **Alt text describes the product state, not the furniture.** These images
   carry product context, so `alt=""` is wrong. Write what a sighted visitor
   learns from the screen: `"…showing the Accessibility Auto-Fixer marking three
   contrast failures on a live page."`
3. **Export AVIF, longest edge 2560px.** `@nuxt/image` derives the rest. Keep the
   master (PSD/TIFF) outside the repo.
4. **One accent per image.** If the scene already has a cyan object, the section
   it sits in does not get a second accent.

## Register

| File | Used on | Subject / scene | Status |
| --- | --- | --- | --- |
| `00-opening-spread.avif` | `/` opening spread | Laptop on plaster worktop, Auto-Fixer marking three contrast failures / studio corner, morning light | **placeholder** |
| `01-auto-fixer-studio.avif` | `/` + `/work` entry 01 | Same laptop, side panel open on the findings list / oak worktop, linen cloth | **placeholder** |
| `02-design-reviewer-studio.avif` | `/` + `/work` entry 02 | Display showing a component diff, two button variants / studio desk, low daylight | **placeholder** |
| `03-deprecation-studio.avif` | `/` + `/work` entry 03 | Screen showing a dependency graph, one node marked for removal / folded print-out on linen | **placeholder** |
| `10-studio-detail.avif` | `/about` | Token file on screen beside a printed component inventory / desk detail | **placeholder** |
| `20-governance-desk.avif` | `/how-it-works` ch. 04 | Screen showing a deprecation timeline, one component marked for removal, beside a printed list of its remaining consumers / desk in daylight | **placeholder** |

While a row says **placeholder**, the site renders a marked dark frame carrying
the intended alt text — never a stand-in photograph. Replace the file, then set
`placeholder: false` (or delete the flag) in `data/products.ts` or the page.
