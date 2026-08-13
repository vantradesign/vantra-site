import type { ToolReferenceEntry } from '~/types/reference'

/**
 * Reference content per tool. See `types/reference.ts` for the register, the
 * content rules, and why this is separate from the editorial layer.
 *
 * Order matches `data/tools.ts`. A tool with no entry here simply renders no
 * reference section — `ToolReference.vue` returns nothing rather than an empty
 * heading, so this file can be filled in over several passes.
 */
export const toolReference: ToolReferenceEntry[] = [
  {
    slug: 'contrast-checker',
    answer:
      'WCAG 2 contrast ratio is calculated as (L1 + 0.05) / (L2 + 0.05), where L1 and L2 are the relative luminances of the lighter and darker colour. Ratios run from 1:1 to 21:1. Body text needs at least 4.5:1 to pass WCAG AA.',
    sections: [
      {
        heading: 'What contrast ratio does text need to pass WCAG?',
        body: [
          'Text under 24px needs 4.5:1 against its background for WCAG 2.2 AA (success criterion 1.4.3). Text from 24px, or from 19px when bold, is treated as large text and needs 3:1.',
          'AAA raises normal text to 7:1 and large text to 4.5:1. Non-text elements such as input borders and focus indicators need 3:1 under criterion 1.4.11.',
        ],
      },
      {
        heading: 'How is the contrast ratio actually computed?',
        body: [
          'Each channel is converted from 0–255 to a 0–1 fraction, linearised — divided by 12.92 below the low-end threshold, otherwise raised to the power 2.4 after an offset — and weighted 0.2126 red, 0.7152 green, 0.0722 blue. That weighted sum is relative luminance.',
          'The two luminances are then compared as (lighter + 0.05) / (darker + 0.05). The 0.05 term is why the scale tops out at 21:1 rather than infinity, and why pure black on pure white is 21:1 exactly.',
          'Green dominates the result because human vision is most sensitive to it. This is why two colours that look equally dark can differ by more than a full ratio point.',
        ],
      },
      {
        heading: 'Why does a passing ratio still look wrong on screen?',
        body: [
          'The ratio is computed from the two colours you supply, but the browser paints the colour that survives the cascade. Inherited opacity, a semi-transparent overlay, or a theme variable resolved differently at runtime all change the real background.',
          'Measure the rendered result, not the design token. This is the specific gap the Accessibility Auto-Fixer exists to close: it reads computed styles on the live page rather than the source.',
        ],
      },
    ],
    table: {
      caption: 'WCAG 2.2 contrast minimums by text size and conformance level',
      columns: ['Content', 'Level AA', 'Level AAA', 'Criterion'],
      rows: [
        ['Body text, under 24px', '4.5:1', '7:1', '1.4.3 / 1.4.6'],
        ['Large text, 24px+ or 19px bold', '3:1', '4.5:1', '1.4.3 / 1.4.6'],
        ['UI components and graphics', '3:1', 'No higher requirement', '1.4.11'],
        ['Disabled controls, decorative text', 'Exempt', 'Exempt', '1.4.3'],
        ['Logotypes', 'Exempt', 'Exempt', '1.4.3'],
      ],
    },
    faq: [
      {
        question: 'Is 3:1 enough for body text?',
        answer:
          'No. 3:1 is the WCAG AA minimum for large text only — 24px and above, or 19px and above when bold. Body text under 24px needs 4.5:1.',
      },
      {
        question: 'Does the contrast checker send my colours anywhere?',
        answer:
          'No. The ratio is computed in your browser from the two hex values you enter. There is no request to any server, no account, and nothing stored.',
      },
      {
        question: 'What is the highest possible contrast ratio?',
        answer:
          '21:1, which is pure black (#000000) against pure white (#ffffff). The lowest is 1:1, which is any colour against itself.',
      },
      {
        question: 'Do WCAG contrast rules apply to icons and borders?',
        answer:
          'Yes, at 3:1. Success criterion 1.4.11 Non-text Contrast covers the visual information needed to identify UI components and states, including input borders, focus indicators and meaningful parts of graphics.',
      },
    ],
    sources: [
      {
        label: 'WCAG 2.2 — Understanding SC 1.4.3 Contrast (Minimum)',
        href: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html',
      },
      {
        label: 'WCAG 2.2 — relative luminance definition',
        href: 'https://www.w3.org/TR/WCAG22/#dfn-relative-luminance',
      },
      {
        label: 'WCAG 2.2 — Understanding SC 1.4.11 Non-text Contrast',
        href: 'https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html',
      },
    ],
  },

  {
    slug: 'aspect-ratio',
    answer:
      'An aspect ratio is width divided by height, reduced to its smallest whole numbers by the greatest common divisor — 1920 × 1080 reduces to 16:9. To find a missing dimension, multiply the known side by the ratio: height = width × 9 / 16.',
    sections: [
      {
        heading: 'How do you calculate an aspect ratio from pixel dimensions?',
        body: [
          'Divide both dimensions by their greatest common divisor. For 1600 × 1200 the divisor is 400, which gives 4:3.',
          'Reduction is what makes ratios comparable: 1920 × 1080 and 1280 × 720 are different sizes but the same 16:9 shape, and only the reduced form shows that.',
        ],
      },
      {
        heading: 'How do you resize an image without distorting it?',
        body: [
          'Keep the ratio constant and solve for the side you do not know. New height = new width × original height / original width.',
          'Rounding is where proportional resizes go wrong. 2560 / 21 × 9 is 1097.14, so a 21:9 frame at 2560px wide is 1097px tall and off by a seventh of a pixel — visible as a one-pixel seam when tiles sit edge to edge.',
        ],
      },
      {
        heading: 'When should you use the CSS aspect-ratio property instead?',
        body: [
          'Use `aspect-ratio` in CSS whenever the browser can reserve the space itself, because it prevents layout shift: the box has a height before the image arrives. Combined with width and height attributes on the element, it is the single most effective fix for Cumulative Layout Shift caused by media.',
          'Calculate a fixed pixel size instead when you are exporting an asset, specifying a crop, or handing dimensions to someone else.',
        ],
      },
    ],
    // No `table` here on purpose. The page already renders the full ratio
    // reference table from ASPECT_REFERENCE in utils/tools/ratio.ts, and
    // repeating it below would put the same eight rows on one URL twice —
    // duplicate content that also gives a model two copies to disagree about.
    // The rule for this file: add a table only where the page has none.
    faq: [
      {
        question: 'What aspect ratio is 1920 × 1080?',
        answer:
          '16:9. Both numbers divide by 120, giving 16 and 9. It is the standard widescreen ratio for video and most displays.',
      },
      {
        question: 'Is 16:9 the same as 1.78:1?',
        answer:
          'Effectively yes. 16 divided by 9 is 1.777…, which film notation rounds to 1.78:1. The two notations describe the same shape; whole-number pairs are used on the web, decimal-to-one in cinema.',
      },
      {
        question: 'How do I keep an image from causing layout shift?',
        answer:
          'Set the CSS aspect-ratio property, or the width and height attributes, so the browser reserves the correct box before the file loads. Without it the page reflows when the image arrives, which is counted as Cumulative Layout Shift.',
      },
    ],
    sources: [
      {
        label: 'MDN — aspect-ratio',
        href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio',
      },
      {
        label: 'web.dev — Cumulative Layout Shift (CLS)',
        href: 'https://web.dev/articles/cls',
      },
    ],
  },

  {
    slug: 'font-pairing',
    answer:
      'A reliable font pairing needs contrast in one dimension and agreement in the rest: pair a display face with a text face, keep their x-height and apparent size compatible, and use no more than two families. Matching moods matter less than matching proportions.',
    sections: [
      {
        heading: 'How do you pair two typefaces?',
        body: [
          'Choose one face to be seen and one to be read. The display face carries headlines, where its personality is an asset at large sizes; the text face carries body copy, where personality becomes fatigue.',
          'Then check they agree on proportion. Two faces at the same font-size can look a size apart if their x-heights differ, which is why a pairing that works in a specimen falls apart in a paragraph.',
        ],
      },
      {
        heading: 'How many typefaces should one site use?',
        body: [
          'Two families is the working default: one display, one text. A third is justified only by a genuinely different job, such as a monospace for code.',
          'Each additional family costs render-blocking weight and a possible layout shift. Two families at two weights each is four files; the same at four weights is eight, and the difference is measurable in Largest Contentful Paint.',
        ],
      },
      {
        heading: 'Do self-hosted fonts perform better than Google Fonts?',
        body: [
          'Self-hosting is faster in every current browser. Cache partitioning ended cross-site font reuse, so a visitor gets no benefit from having loaded the same Google font elsewhere, and the third-party origin adds a DNS lookup, a TCP connection and a TLS handshake before the first byte.',
          'Self-hosting also removes a third-party request from the page, which is why every font on this site is served from its own origin.',
        ],
      },
    ],
    faq: [
      {
        question: 'What is the safest font pairing?',
        answer:
          'A geometric or grotesque sans for headlines with a humanist sans or a transitional serif for body text. The contrast is legible at a glance and neither face fights the other in a paragraph.',
      },
      {
        question: 'Can you pair two serifs?',
        answer:
          'Yes, if they differ in structure rather than just in name — a high-contrast display serif with a sturdy text serif. Two serifs from the same era and similar proportions read as a mistake rather than a pairing.',
      },
      {
        question: 'Are the fonts in this tool free to use?',
        answer:
          'Every family previewed here is an open-source typeface available through Fontsource. Check each family\'s own licence before commercial use; most are SIL Open Font License.',
      },
    ],
    sources: [
      {
        label: 'MDN — Web fonts',
        href: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Text_styling/Web_fonts',
      },
      {
        label: 'web.dev — Best practices for fonts',
        href: 'https://web.dev/articles/font-best-practices',
      },
    ],
  },

  {
    slug: 'type-scale',
    answer:
      'A modular type scale multiplies a base size by a ratio raised to each step: 16px at a 1.25 ratio gives 20px, 25px, 31.25px upward and 12.8px downward. Common ratios are 1.2 (minor third), 1.25 (major third), 1.333 (perfect fourth) and 1.618 (golden ratio).',
    sections: [
      {
        heading: 'How is a modular type scale calculated?',
        body: [
          'Each step is base × ratio^n, where n is the step\'s distance from the base. A 16px base at 1.25 produces 16, 20, 25, 31.25 and 39.06 going up, and 12.8 going down.',
          'This scale runs eight steps with the base at position two, so the caption tier below body text is part of the system rather than an exception bolted on later.',
        ],
      },
      {
        heading: 'Which ratio should you choose?',
        body: [
          'Ratios between 1.2 and 1.333 suit interfaces, where many sizes must coexist in one dense screen. 1.618 suits editorial layouts with few sizes and large jumps between them.',
          'The higher the ratio, the faster the top steps run away: at 1.618 the fifth step above a 16px base is 179px, which is a poster, not a heading.',
        ],
      },
      {
        heading: 'Should a type scale be fluid or static?',
        body: [
          'Fluid, if the top of the scale is large. A ratio that reads well at 1440px is usually too steep at 320px, because the display and cover steps overflow a narrow screen long before the body text does.',
          'This tool\'s fluid mode therefore takes two ratios, one per end, and interpolates every step between them with clamp(). A single ratio stretched across both ends is the common mistake — it fixes the base size and leaves the headline broken.',
        ],
      },
    ],
    table: {
      caption: 'Modular scale ratios, their musical names and where each is appropriate',
      columns: ['Ratio', 'Name', 'Step above 16px', 'Suited to'],
      rows: [
        ['1.067', 'Minor second', '17.07px', 'Dense data UI, very gentle hierarchy'],
        ['1.2', 'Minor third', '19.2px', 'Interfaces, narrow viewports'],
        ['1.25', 'Major third', '20px', 'General-purpose product UI'],
        ['1.333', 'Perfect fourth', '21.33px', 'Marketing pages, clear hierarchy'],
        ['1.618', 'Golden ratio', '25.89px', 'Editorial, few sizes, big jumps'],
      ],
    },
    faq: [
      {
        question: 'What is a good base font size for body text?',
        answer:
          '16px, which is the default in every major browser. Setting it smaller means the user has to zoom, and expressing it in rem keeps their own browser setting intact.',
      },
      {
        question: 'Should type steps be in rem or px?',
        answer:
          'rem. A size in rem scales with the user\'s browser font-size setting; a size in px ignores it, which fails WCAG 2.2 success criterion 1.4.4 Resize Text if the text cannot reach 200%.',
      },
      {
        question: 'How many steps does a type scale need?',
        answer:
          'Six to eight. Fewer forces unrelated content to share a size; more produces steps too close together to read as distinct, and nobody can remember which is which.',
      },
    ],
    sources: [
      {
        label: 'MDN — font-size',
        href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/font-size',
      },
      {
        label: 'WCAG 2.2 — Understanding SC 1.4.4 Resize Text',
        href: 'https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html',
      },
    ],
  },

  {
    slug: 'spacing-scale',
    answer:
      'A spacing scale is a fixed set of multiples of one base unit, usually 4px or 8px. Ten steps from 0.5× to 16× — 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 on a 4pt grid — cover almost every layout need without arbitrary values.',
    sections: [
      {
        heading: 'Should a spacing scale use a 4pt or an 8pt grid?',
        body: [
          '4px as the base unit with 8px as the working increment. A pure 8pt grid has no legal value between 8 and 16, which is exactly where icon gaps and label spacing live.',
          'Both units divide cleanly into the common device pixel ratios, so neither produces half-pixel rendering at 1×, 2× or 3×.',
        ],
      },
      {
        heading: 'Why use multipliers instead of a geometric ratio?',
        body: [
          'Spacing is judged by alignment, not by proportion. Multiples of a base unit keep every edge on the same grid; a geometric ratio produces values like 25.6px that never line up with anything else on the page.',
          'The multipliers here — 0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16 — get further apart as they grow, which matches how spacing is actually used: fine control at small sizes, coarse steps between sections.',
        ],
      },
      {
        heading: 'When should spacing be fluid?',
        body: [
          'For the gaps between major sections, and for page gutters. A 128px section gap is right on a desktop and absurd on a 320px phone, where it consumes a third of the screen.',
          'Keep small steps static. Fluid values below about 16px change by a pixel or two across the whole viewport range, which is invisible and makes the CSS harder to read for nothing.',
        ],
      },
    ],
    table: {
      caption: 'Ten-step spacing scale on a 4pt and an 8pt base unit',
      columns: ['Token', 'Multiplier', '4pt base', '8pt base'],
      rows: [
        ['3xs', '0.5×', '2px', '4px'],
        ['2xs', '1×', '4px', '8px'],
        ['xs', '1.5×', '6px', '12px'],
        ['sm', '2×', '8px', '16px'],
        ['md', '3×', '12px', '24px'],
        ['lg', '4×', '16px', '32px'],
        ['xl', '6×', '24px', '48px'],
        ['2xl', '8×', '32px', '64px'],
        ['3xl', '12×', '48px', '96px'],
        ['4xl', '16×', '64px', '128px'],
      ],
    },
    faq: [
      {
        question: 'What is the 8pt grid?',
        answer:
          'A convention where every spacing and sizing value is a multiple of 8px. It reduces arbitrary decisions and keeps elements aligned across components, with 4px commonly allowed as a half step.',
      },
      {
        question: 'How many spacing tokens should a design system have?',
        answer:
          'Around ten. That is enough to cover everything from an icon gap to a section break, and few enough that a designer can hold the whole set in mind and reach for the same value twice.',
      },
      {
        question: 'Should spacing tokens be in rem or px?',
        answer:
          'rem for anything that should grow when a user increases their browser font size, which includes padding around text. px is defensible for hairline borders and optical adjustments that should not scale.',
      },
    ],
    sources: [
      {
        label: 'MDN — CSS custom properties',
        href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties',
      },
      {
        label: 'MDN — margin',
        href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/margin',
      },
    ],
  },

  {
    slug: 'shade-tint-generator',
    answer:
      'A shade is a colour mixed toward black, a tint is mixed toward white. A usable ten-step ramp is built by holding hue fixed and re-anchoring lightness at set values — 97% down to 14% — rather than by blending the base colour with black and white.',
    sections: [
      {
        heading: 'What is the difference between a shade, a tint and a tone?',
        body: [
          'A shade adds black, a tint adds white, and a tone adds grey. In practice a colour ramp needs both directions from one base, which is why the two are generated together.',
          'Naming matters when the ramp becomes tokens: 50 is the palest tint and 900 the deepest shade, following the convention most design systems and Tailwind use.',
        ],
      },
      {
        heading: 'Why does mixing with black produce muddy colours?',
        body: [
          'Because blending toward black drops saturation and shifts perceived hue at the same time, so the dark end of the ramp turns grey-brown instead of staying the same colour.',
          'This tool instead sets each step to a target lightness while holding hue constant, and eases saturation down toward the pale end so the tints do not read as chalky. The result is ten steps that still look like one colour family.',
        ],
      },
      {
        heading: 'Which steps in a ramp are safe for text?',
        body: [
          'Check every step rather than assuming. Each step here is measured against both white and black, because the crossover point — where a ramp stops working with white text and starts working with black — is rarely where it looks like it should be.',
          'For body text the step needs 4.5:1 against its background. Mid-ramp steps around 400 and 500 frequently fail against both white and black, which makes them background colours, not text colours.',
        ],
      },
    ],
    faq: [
      {
        question: 'How many steps should a colour ramp have?',
        answer:
          'Ten, numbered 50 to 900. That gives enough range for backgrounds, borders, text and hover states while keeping adjacent steps visibly different.',
      },
      {
        question: 'Can I use a mid-ramp colour for body text?',
        answer:
          'Usually not. Steps around 400 and 500 often fall below 4.5:1 against both white and black, which means they pass WCAG AA as neither light nor dark text. Use 600 and above on light backgrounds.',
      },
      {
        question: 'Does this generator export to Tailwind?',
        answer:
          'Yes. The ramp can be copied as a Tailwind colour config block with the 50–900 keys already in place.',
      },
    ],
    sources: [
      {
        label: 'MDN — hsl() colour function',
        href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hsl',
      },
      {
        label: 'WCAG 2.2 — Understanding SC 1.4.3 Contrast (Minimum)',
        href: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html',
      },
    ],
  },

  {
    slug: 'easing-curves',
    answer:
      'A CSS cubic-bezier() easing function takes four numbers — the x and y coordinates of two control points between a fixed start (0,0) and end (1,1). x values must stay between 0 and 1; y values may go outside it, which is how overshoot and anticipation are produced.',
    sections: [
      {
        heading: 'What do the four cubic-bezier values mean?',
        body: [
          'They are two control points: x1, y1 for the first and x2, y2 for the second. The x axis is time from 0 to 1, the y axis is progress through the animated value.',
          'The start and end points are fixed at (0,0) and (1,1) and cannot be changed. Only the two handles are yours, which is why every CSS easing curve is a cubic with exactly four parameters.',
        ],
      },
      {
        heading: 'Why can y go above 1 but x cannot?',
        body: [
          'x is time, and time cannot run backwards — an x outside 0–1 would make the curve non-monotonic in time, so the specification forbids it.',
          'y is progress, and progress may exceed its target and come back. A y above 1 overshoots the end value; a y below 0 pulls back before moving forward. That is the entire mechanism behind bounce and anticipation.',
        ],
      },
      {
        heading: 'Which easing should UI motion use?',
        body: [
          'ease-out for anything entering or responding to a click, because it moves fastest at the start and the interface feels immediate. ease-in-out for elements moving between two on-screen positions.',
          'Avoid ease-in alone for entrances: it starts slowly, which reads as lag. And keep durations short — a curve cannot rescue a 600ms transition on a button.',
        ],
      },
      {
        heading: 'Does easing need to respect reduced motion?',
        body: [
          'Yes. Users who set prefers-reduced-motion do so because animation causes them discomfort, and no easing curve makes a large movement comfortable.',
          'Wrap non-essential motion in a prefers-reduced-motion: no-preference query rather than only shortening the duration. This site does the same with both of its own motion patterns.',
        ],
      },
    ],
    table: {
      caption: 'CSS easing keywords with their cubic-bezier equivalents',
      columns: ['Keyword', 'cubic-bezier equivalent', 'Character', 'Use for'],
      rows: [
        ['linear', 'cubic-bezier(0, 0, 1, 1)', 'No acceleration', 'Progress bars, loops'],
        ['ease', 'cubic-bezier(0.25, 0.1, 0.25, 1)', 'Browser default', 'Nothing in particular'],
        ['ease-in', 'cubic-bezier(0.42, 0, 1, 1)', 'Slow start', 'Elements leaving the screen'],
        ['ease-out', 'cubic-bezier(0, 0, 0.58, 1)', 'Fast start', 'Entrances, click responses'],
        [
          'ease-in-out',
          'cubic-bezier(0.42, 0, 0.58, 1)',
          'Slow at both ends',
          'On-screen position changes',
        ],
      ],
    },
    faq: [
      {
        question: 'What is the difference between ease-in and ease-out?',
        answer:
          'ease-in starts slowly and accelerates, which suits elements leaving the screen. ease-out starts fast and decelerates, which suits entrances and responses to input because the motion begins immediately.',
      },
      {
        question: 'How do I make a bounce with cubic-bezier?',
        answer:
          'Set the second control point\'s y value above 1, for example cubic-bezier(0.34, 1.56, 0.64, 1). The curve overshoots the final value and settles back. A true multi-bounce needs keyframes, since one cubic curve can only overshoot once.',
      },
      {
        question: 'Can cubic-bezier x values be negative?',
        answer:
          'No. The x coordinates of both control points must be in the range 0 to 1 because x represents time. A value outside that range makes the declaration invalid and the browser ignores it.',
      },
    ],
    sources: [
      {
        label: 'MDN — cubic-bezier() easing function',
        href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function/cubic-bezier',
      },
      {
        label: 'MDN — prefers-reduced-motion',
        href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion',
      },
    ],
  },

  {
    slug: 'unit-converter',
    answer:
      'To convert px to rem, divide by the root font size — 24px ÷ 16 = 1.5rem. rem is always relative to the root element; em is relative to the current element\'s font size. Points convert at 0.75pt per px, so 16px is 12pt.',
    sections: [
      {
        heading: 'What is the difference between rem and em?',
        body: [
          'rem is relative to the root element\'s font size and is therefore the same everywhere in the document. em is relative to the font size of the element it is used on, so it compounds through nesting.',
          'That compounding is a feature for component-internal spacing — padding in em scales with the component\'s own text — and a bug for a global scale, where a nested list can end up at a size nobody chose.',
        ],
      },
      {
        heading: 'Why is 16px the default root font size?',
        body: [
          'Because every major browser ships 16px as the default, and that default is a user preference someone may have changed. Expressing sizes in rem honours the change; expressing them in px overrides it.',
          'This is why the converter lets you set the root size: if your CSS sets html { font-size: 62.5% } to make 1rem equal 10px, every conversion on the page shifts with it.',
        ],
      },
      {
        heading: 'Should CSS use px or rem?',
        body: [
          'rem for type, and for spacing that surrounds type. WCAG 2.2 success criterion 1.4.4 requires text to scale to 200% without loss of content, and text sized in px does not respond to the browser font-size setting at all.',
          'px remains correct for hairline borders, shadow offsets and anything that should stay one physical pixel regardless of text size.',
        ],
      },
    ],
    table: {
      caption: 'Pixel values converted to rem, em and points at a 16px root font size',
      columns: ['px', 'rem', 'em', 'pt'],
      rows: [
        ['12px', '0.75rem', '0.75em', '9pt'],
        ['14px', '0.875rem', '0.875em', '10.5pt'],
        ['16px', '1rem', '1em', '12pt'],
        ['18px', '1.125rem', '1.125em', '13.5pt'],
        ['24px', '1.5rem', '1.5em', '18pt'],
        ['32px', '2rem', '2em', '24pt'],
        ['48px', '3rem', '3em', '36pt'],
      ],
    },
    faq: [
      {
        question: 'How many px is 1rem?',
        answer:
          '16px by default, because that is the default root font size in every major browser. If the root font size has been changed, 1rem equals whatever that new value is.',
      },
      {
        question: 'How do I convert px to rem?',
        answer:
          'Divide the pixel value by the root font size. At the default 16px root, 24px is 1.5rem and 12px is 0.75rem.',
      },
      {
        question: 'Is pt a valid CSS unit for screens?',
        answer:
          'It is valid but not appropriate. pt is an absolute print unit fixed at 1/72 inch, defined in CSS as 1.333px. Use rem for screen typography and reserve pt for print stylesheets.',
      },
    ],
    sources: [
      {
        label: 'MDN — CSS length units',
        href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/length',
      },
      {
        label: 'WCAG 2.2 — Understanding SC 1.4.4 Resize Text',
        href: 'https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html',
      },
    ],
  },

  {
    slug: 'shadow-playground',
    answer:
      'A convincing CSS shadow uses two or three stacked box-shadow layers, not one: a tight, near-opaque layer for contact and one or two wider, fainter layers for ambient light. box-shadow accepts a comma-separated list, drawn first layer on top.',
    sections: [
      {
        heading: 'Why do layered shadows look more realistic?',
        body: [
          'Because real shadows have two components. A small dark region where the object nearly touches the surface, and a broad soft region from ambient light — one blur radius cannot be both.',
          'A single 0 4px 12px shadow at 20% opacity reads as a grey smudge. The same total darkness split across a 1px contact layer and a 16px ambient layer reads as elevation.',
        ],
      },
      {
        heading: 'What do the box-shadow values mean?',
        body: [
          'In order: horizontal offset, vertical offset, blur radius, optional spread radius, then colour. The blur radius softens the edge; the spread grows or shrinks the whole shape before blurring.',
          'Keep the horizontal offset at 0 for interface elevation. A sideways shadow implies a light source to one side, which is only consistent if every shadow on the page agrees with it.',
        ],
      },
      {
        heading: 'How do border-radius and shadow relate?',
        body: [
          'The shadow follows the border box, so it inherits the radius automatically. The mistake is nesting: a child inside a rounded parent needs a smaller radius than its parent, not the same one.',
          'The rule is that the inner radius equals the outer radius minus the padding between them. Equal radii make the gap between the two curves appear to pinch.',
        ],
      },
      {
        heading: 'Do shadows affect performance?',
        body: [
          'A static box-shadow is cheap. Animating one is not, because the browser repaints the blurred region on every frame.',
          'To animate elevation, cross-fade the opacity of a pseudo-element that carries the larger shadow. Opacity is compositor-friendly; blur radius is not.',
        ],
      },
    ],
    faq: [
      {
        question: 'How many shadow layers should an elevation use?',
        answer:
          'Two or three. One tight layer with a small blur for contact, plus one or two wider, lower-opacity layers for ambient light. More than three adds paint cost without a visible difference.',
      },
      {
        question: 'What is the difference between blur and spread in box-shadow?',
        answer:
          'Blur softens the shadow\'s edge outward from its shape. Spread changes the size of the shape itself before any blurring, and can be negative to pull the shadow in behind the element.',
      },
      {
        question: 'Why does my nested rounded corner look wrong?',
        answer:
          'Because the inner and outer radii are the same. The inner radius should be the outer radius minus the padding between them, otherwise the two curves are not concentric and the gap appears to pinch.',
      },
    ],
    sources: [
      {
        label: 'MDN — box-shadow',
        href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow',
      },
      {
        label: 'MDN — border-radius',
        href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/border-radius',
      },
    ],
  },

  {
    slug: 'clamp-calculator',
    answer:
      'CSS clamp(min, preferred, max) returns the preferred value unless it falls outside the bounds, in which case it returns the nearer bound. For a fluid size, the preferred term is a linear equation: slope = (maxValue − minValue) / (maxViewport − minViewport), expressed as rem + vw.',
    sections: [
      {
        heading: 'What does CSS clamp() do?',
        body: [
          'clamp() takes three values — a minimum, a preferred value, and a maximum — and resolves to the preferred value clamped between the other two. It is equivalent to max(min, min(preferred, max)).',
          'It is supported in all current browsers and can be used anywhere a length is valid: font-size, padding, width, gap, even inside a calc().',
        ],
      },
      {
        heading: 'How do you calculate a fluid clamp() value?',
        body: [
          'Take the two sizes you want and the two viewport widths they belong to, then find the straight line between them. The slope is (maxValue − minValue) / (maxViewport − minViewport), and multiplying it by 100 gives the vw coefficient.',
          'The intercept is minValue − slope × minViewport, converted to rem. For 18px at 320px growing to 48px at 1440px, the slope is 0.0268, giving 2.679vw, and the intercept is 9.43px or 0.5893rem.',
          'The finished declaration is clamp(1.125rem, 0.5893rem + 2.679vw, 3rem). Below 320px it holds at 18px; above 1440px it holds at 48px.',
        ],
      },
      {
        heading: 'Why must the preferred value include a rem term?',
        body: [
          'Because a preferred value expressed in vw alone ignores the user\'s font-size setting. A font-size of clamp(1.125rem, 3vw, 3rem) is fixed to viewport width, so zooming the text changes nothing until the value hits one of the bounds.',
          'That is a WCAG 2.2 failure under success criterion 1.4.4 Resize Text, which requires text to reach 200% without loss of content. Adding the rem intercept restores the response to zoom, which is why this calculator never emits a bare vw preferred term.',
        ],
      },
      {
        heading: 'When should you use clamp() instead of a media query?',
        body: [
          'Use clamp() when a value should change continuously — type sizes, gutters, section spacing. It removes the visible jump at each breakpoint and replaces several declarations with one.',
          'Use a media query when something changes discretely: a two-column grid becoming one column, or an element being hidden. clamp() interpolates numbers, so it cannot express a layout that reorganises.',
        ],
      },
    ],
    table: {
      caption:
        'Fluid clamp() values for a 320px to 1440px viewport range, with the resolved size at three widths',
      columns: ['Purpose', 'Declaration', 'At 320px', 'At 768px', 'At 1440px'],
      rows: [
        [
          'Body text, 16→18px',
          'clamp(1rem, 0.9643rem + 0.1786vw, 1.125rem)',
          '16px',
          '16.8px',
          '18px',
        ],
        [
          'Heading, 32→64px',
          'clamp(2rem, 1.4286rem + 2.8571vw, 4rem)',
          '32px',
          '44.8px',
          '64px',
        ],
        [
          'Section gap, 64→160px',
          'clamp(4rem, 2.2857rem + 8.5714vw, 10rem)',
          '64px',
          '102.4px',
          '160px',
        ],
        [
          'Page gutter, 20→96px',
          'clamp(1.25rem, -0.1071rem + 6.7857vw, 6rem)',
          '20px',
          '50.4px',
          '96px',
        ],
      ],
    },
    faq: [
      {
        question: 'What is the CSS clamp() formula for fluid typography?',
        answer:
          'clamp(minValue, intercept + slopevw, maxValue), where slope = (maxValue − minValue) / (maxViewport − minViewport) × 100 and intercept = minValue − slope × minViewport, both converted to rem. The rem term is required so the value still responds to browser text zoom.',
      },
      {
        question: 'Is clamp() supported in all browsers?',
        answer:
          'Yes. clamp(), min() and max() are supported in all current versions of Chrome, Edge, Firefox and Safari, and have been since 2020.',
      },
      {
        question: 'Why should the preferred value not be vw alone?',
        answer:
          'Because a value in vw alone does not respond to the user\'s browser font-size setting, so the text cannot be zoomed to 200%. That fails WCAG 2.2 success criterion 1.4.4. Always include a rem term alongside the vw term.',
      },
      {
        question: 'Can clamp() be used for anything other than font-size?',
        answer:
          'Yes. It is valid wherever a length is, including padding, margin, width, gap, border-radius and inside calc(). This calculator can preview a value as either a font-size or a padding.',
      },
      {
        question: 'What is the difference between clamp() and a fluid type scale?',
        answer:
          'clamp() produces one fluid value. A fluid type scale produces a whole set of them, applying a ratio at each end of the viewport range so every step interpolates. Use this calculator for a one-off size and the type scale for a system.',
      },
    ],
    sources: [
      {
        label: 'MDN — clamp()',
        href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/clamp',
      },
      {
        label: 'CSS Values and Units Module Level 4 — clamp()',
        href: 'https://www.w3.org/TR/css-values-4/#funcdef-clamp',
      },
      {
        label: 'WCAG 2.2 — Understanding SC 1.4.4 Resize Text',
        href: 'https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html',
      },
    ],
  },

  {
    slug: 'layout-builder',
    answer:
      'CSS Grid places items in two dimensions at once and is the right choice when rows and columns must both align. Flexbox distributes items along one axis and is the right choice when the number of items is unknown. Named grid-template-areas is the most readable way to define a page-level grid.',
    sections: [
      {
        heading: 'When should you use CSS Grid instead of Flexbox?',
        body: [
          'Use Grid when alignment matters in both directions — a page shell, a card grid where rows must line up, a form where labels and fields share a column. Grid is defined by the container, so items land in tracks the parent declared.',
          'Use Flexbox when content length decides the layout: a toolbar, a tag list, a row of buttons. Flexbox sizes from the content outward, which is why an unknown number of items belongs on a flex row.',
          'They compose. A grid area containing a flex row is normal and correct, and most real layouts use both.',
        ],
      },
      {
        heading: 'How do grid-template-areas work?',
        body: [
          'Each string in grid-template-areas is one row, and each word in it names the area occupying that cell. Repeating a name across adjacent cells makes that area span them, and a full stop leaves the cell empty.',
          'Children are then placed with grid-area: header, with no line numbers anywhere. The advantage is that the CSS is a picture of the layout — a reviewer can see the shape without rendering it.',
          'The named strings must form a rectangle. A name that appears in a non-rectangular arrangement makes the whole declaration invalid.',
        ],
      },
      {
        heading: 'What does subgrid do?',
        body: [
          'subgrid makes a nested grid use its parent\'s tracks instead of creating its own. Set grid-template-rows: subgrid on a child and its rows align to the parent\'s rows.',
          'The problem it solves is card alignment. Three cards each containing a title, body and footer will not line their footers up if each card is an independent grid, because each sizes its own rows from its own content. With subgrid they share the parent\'s row tracks and align across cards.',
          'It is supported in all current browsers — Firefox from 2019, Safari from 2022, Chrome and Edge from late 2023.',
        ],
      },
      {
        heading: 'How do you make a grid responsive without media queries?',
        body: [
          'repeat(auto-fit, minmax(16rem, 1fr)) creates as many columns as fit, each at least 16rem wide, and stretches them to fill the row. Column count then follows available width with no breakpoints.',
          'auto-fill differs from auto-fit in one respect: auto-fill keeps empty tracks, auto-fit collapses them. For a card grid that should centre when nearly empty, auto-fit is usually what you want.',
        ],
      },
    ],
    table: {
      caption: 'CSS Grid compared with Flexbox across the decisions that determine which to use',
      columns: ['Consideration', 'CSS Grid', 'Flexbox'],
      rows: [
        ['Axes', 'Two at once — rows and columns', 'One at a time'],
        ['Layout defined by', 'The container', 'The content'],
        ['Item count', 'Known, or generated by auto-fit', 'Unknown or variable'],
        ['Gaps', 'gap, row-gap, column-gap', 'gap, row-gap, column-gap'],
        ['Overlapping items', 'Supported via line placement', 'Not supported'],
        ['Aligning across siblings', 'Yes, including with subgrid', 'Only within one line'],
        ['Typical use', 'Page shell, card grid, form', 'Toolbar, tag list, button row'],
      ],
    },
    faq: [
      {
        question: 'Should I use CSS Grid or Flexbox?',
        answer:
          'Grid when you need alignment in two dimensions and the container defines the layout, such as a page shell or a card grid. Flexbox when items are distributed along one axis and their content decides the sizing, such as a toolbar. Most layouts use both together.',
      },
      {
        question: 'What is subgrid used for?',
        answer:
          'Aligning the internals of sibling elements to a shared set of tracks. The standard case is three cards whose titles, bodies and footers should line up across cards — without subgrid each card sizes its own rows from its own content and the footers do not match.',
      },
      {
        question: 'What is the difference between auto-fit and auto-fill?',
        answer:
          'Both create as many tracks as fit the container. auto-fill keeps empty tracks in place, so items stay at their original width; auto-fit collapses empty tracks, so the existing items stretch to fill the row.',
      },
      {
        question: 'Does this builder export Tailwind classes?',
        answer:
          'Yes. The same layout can be copied as plain CSS or as Tailwind v4 utility classes.',
      },
      {
        question: 'Does the prompt field send my layout description to a cloud service?',
        answer:
          'No. It talks to a model running on your own machine through Ollama at localhost:11434, which is a loopback address the request cannot leave. There is no hosted API option and no key to enter.',
      },
    ],
    sources: [
      {
        label: 'MDN — grid-template-areas',
        href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-areas',
      },
      {
        label: 'MDN — Subgrid',
        href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Subgrid',
      },
      {
        label: 'CSS Grid Layout Module Level 2 — subgrids',
        href: 'https://www.w3.org/TR/css-grid-2/#subgrids',
      },
    ],
  },
]

export function referenceForTool(slug: string): ToolReferenceEntry | undefined {
  return toolReference.find((entry) => entry.slug === slug)
}
