export type ProductStatus = 'available' | 'in-development' | 'planned'

/** AI-generated editorial/mood imagery. Home + /work index only. */
export interface MoodImage {
  /** Path under /public/editorial/. Registered in editorial/MANIFEST.md. */
  src: string
  /**
   * Describes the real product state visible inside the scene. Never empty:
   * these images frame actual product context, so WCAG requires meaningful
   * alt text rather than treating them as decorative.
   */
  alt: string
  /** object-position for asymmetric full-bleed crops. */
  focal?: string
  /** Placeholder assets render a marked frame instead of an <img>. */
  placeholder?: boolean
}

/** Real, unretouched product media. /work/[slug] only. */
export interface ProductMedia {
  kind: 'video' | 'image'
  /** Path under /public/media/<slug>/. Registered in media/MANIFEST.md. */
  src: string
  /** Poster frame for video. Also the reduced-motion still. */
  poster?: string
  alt: string
  caption: string
  /** Native aspect ratio, e.g. '16 / 9'. Reserves space to avoid CLS. */
  ratio: string
  placeholder?: boolean
}

export interface ProductLink {
  label: string
  href: string
}

export interface Product {
  slug: string
  /** Short name used in navigation and the /work index. */
  name: string
  /** Magazine cover line. Sentence case, ends in a full stop. */
  coverLine: string
  /** One line, factual, used under the hero and in meta description. */
  summary: string
  status: ProductStatus
  license: string
  /** Ordered index label shown in the caption layer, e.g. '01'. */
  index: string
  /** Single accent for this entry's compositions. */
  accent: 'blue' | 'cyan'
  mood: MoodImage
  problem: string
  /** Editorial prose, not a numbered feature list. */
  howItWorks: { heading: string; body: string }[]
  media: ProductMedia[]
  transparency: {
    automatic: string[]
    manual: string[]
    locality: string
  }
  roadmap: string
  links: ProductLink[]
}
