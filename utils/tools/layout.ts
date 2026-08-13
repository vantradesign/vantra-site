/**
 * The layout builder's model and its two emitters.
 *
 * Everything here is pure: no Vue, no DOM, no fetch. The builder state is the
 * single source of truth, and both outputs (raw CSS and Tailwind v4 arbitrary
 * values) are derived from it. That is what makes an AI suggestion editable
 * afterwards — it lands in this state, not in a string of CSS.
 */

export type LayoutMode = 'grid' | 'flex'

/**
 * Which edges a resize handle moves. Lives here rather than in a component
 * because both the handle that starts the drag and the canvas that resolves it
 * need the same vocabulary.
 */
export type ResizeEdge = 'n' | 's' | 'e' | 'w'

/* ── Enumerations ────────────────────────────────────────────────────────── */

export const JUSTIFY_CONTENT = [
  'start',
  'center',
  'end',
  'stretch',
  'space-between',
  'space-around',
  'space-evenly',
] as const

export const ALIGN_CONTENT = JUSTIFY_CONTENT

export const PLACE_ITEMS = ['start', 'center', 'end', 'stretch'] as const

/** `auto` is the real initial value for the self-properties, unlike the container ones. */
export const PLACE_SELF = ['auto', 'start', 'center', 'end', 'stretch'] as const

export const FLEX_DIRECTION = ['row', 'row-reverse', 'column', 'column-reverse'] as const

export const FLEX_WRAP = ['nowrap', 'wrap', 'wrap-reverse'] as const

export const FLEX_ALIGN_ITEMS = ['stretch', 'flex-start', 'center', 'flex-end', 'baseline'] as const

export type JustifyContent = (typeof JUSTIFY_CONTENT)[number]
export type PlaceItems = (typeof PLACE_ITEMS)[number]
export type PlaceSelf = (typeof PLACE_SELF)[number]
export type FlexDirection = (typeof FLEX_DIRECTION)[number]
export type FlexWrap = (typeof FLEX_WRAP)[number]
export type FlexAlignItems = (typeof FLEX_ALIGN_ITEMS)[number]

/* ── State ───────────────────────────────────────────────────────────────── */

/** A nested grid living inside one item. Subgrid inherits the parent's tracks. */
export interface SubgridState {
  enabled: boolean
  /** When true, emit `subgrid` instead of the explicit track list. */
  columnsSubgrid: boolean
  rowsSubgrid: boolean
  columns: string[]
  rows: string[]
  /** Placeholder children drawn inside the nested grid. */
  childCount: number
}

export interface LayoutItemState {
  id: number
  /** Doubles as the grid area name and the generated class, so it must stay ident-safe. */
  name: string
  /** Grid placement. `area` wins over column/row when the container uses named areas. */
  column: string
  row: string
  justifySelf: PlaceSelf
  alignSelf: PlaceSelf
  subgrid: SubgridState
  /** Flex placement. Kept alongside the grid values so a mode switch loses nothing. */
  flexGrow: number
  flexShrink: number
  flexBasis: string
  order: number
}

export interface GridState {
  columns: string[]
  rows: string[]
  columnGap: string
  rowGap: string
  /** When linked, one `gap` shorthand is emitted from `rowGap`. */
  gapLinked: boolean
  /** One string per row, each holding `columnCount` area names. `.` means empty. */
  areas: string[]
  useAreas: boolean
  justifyContent: JustifyContent
  alignContent: JustifyContent
  justifyItems: PlaceItems
  alignItems: PlaceItems
}

export interface FlexState {
  direction: FlexDirection
  wrap: FlexWrap
  justifyContent: JustifyContent
  alignItems: FlexAlignItems
  alignContent: JustifyContent
  columnGap: string
  rowGap: string
  gapLinked: boolean
}

export interface BuilderState {
  mode: LayoutMode
  grid: GridState
  flex: FlexState
  items: LayoutItemState[]
  /** `null` means the container itself is selected. */
  selectedId: number | null
}

/* ── Track lists ─────────────────────────────────────────────────────────── */

/**
 * Splits a raw track list on top-level whitespace, so `minmax(200px, 1fr) 1fr`
 * stays two tracks rather than three. This is what keeps the advanced raw input
 * and the per-track stepper UI in sync in both directions.
 */
export function parseTrackList(raw: string): string[] {
  const tracks: string[] = []
  let depth = 0
  let current = ''

  for (const char of raw.trim()) {
    if (char === '(') depth += 1
    else if (char === ')') depth = Math.max(0, depth - 1)

    if (depth === 0 && /\s/.test(char)) {
      if (current) {
        tracks.push(current)
        current = ''
      }
      continue
    }

    /* Collapse the whitespace inside functions: `minmax(200px,1fr)` is the same
       track as `minmax(200px, 1fr)`, and one spelling keeps comparisons cheap. */
    if (depth > 0 && /\s/.test(char)) continue

    current += char
  }

  if (current) tracks.push(current)
  return tracks
}

export function formatTrackList(tracks: string[]): string {
  return tracks.filter(Boolean).join(' ')
}

/**
 * The track list as one value per column, which both the named-areas editor and
 * the line-number ruler need. `repeat()` with an integer count is expanded;
 * `auto-fill` / `auto-fit` cannot be known without a container width, so their
 * pattern is listed once and labelled as approximate in the UI.
 */
export function expandTracks(tracks: string[]): string[] {
  return tracks.flatMap((track) => {
    const repeat = /^repeat\(\s*([^,]+),(.+)\)$/i.exec(track)
    if (!repeat) return [track]

    /* Parsed as-is: the regex already took everything after the count's comma,
       and tracks inside a repeat() are space-separated. Replacing commas here
       would reach into minmax() and turn it into minmax(240px1fr) — harmless
       while only the count was used, wrong now that the value is displayed. */
    const inner = parseTrackList(repeat[2]!)
    if (inner.length === 0) return [track]

    const count = Number(repeat[1])
    if (!Number.isInteger(count) || count < 1) return inner

    return Array.from({ length: count }, () => inner).flat()
  })
}

/** How many columns a track list actually produces. */
export function countTracks(tracks: string[]): number {
  return expandTracks(tracks).length
}

/* ── Names ───────────────────────────────────────────────────────────────── */

/**
 * Grid area names are CSS identifiers and the generated class names reuse them,
 * so anything a user types has to survive both. Digits-first is prefixed rather
 * than dropped, because `.2col` is not a selector.
 */
export function safeName(input: string, fallback = 'item'): string {
  const slug = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  if (!slug) return fallback
  return /^[0-9]/.test(slug) ? `area-${slug}` : slug
}

/** Ensures a new item's name does not collide with an existing area name. */
export function uniqueName(base: string, taken: readonly string[]): string {
  const name = safeName(base)
  if (!taken.includes(name)) return name

  let suffix = 2
  while (taken.includes(`${name}-${suffix}`)) suffix += 1
  return `${name}-${suffix}`
}

/* ── CSS emission ────────────────────────────────────────────────────────── */

const CONTAINER_CLASS = 'layout'

function declaration(property: string, value: string): string {
  return `  ${property}: ${value};`
}

/** Only emit a property when it differs from the CSS initial value. */
function optional(property: string, value: string, initial: string): string | null {
  return value === initial ? null : declaration(property, value)
}

function gapDeclarations(
  gap: { rowGap: string; columnGap: string; gapLinked: boolean },
): string[] {
  if (gap.gapLinked) {
    return gap.rowGap === '0' || gap.rowGap === '' ? [] : [declaration('gap', gap.rowGap)]
  }

  return [
    gap.rowGap && gap.rowGap !== '0' ? declaration('row-gap', gap.rowGap) : null,
    gap.columnGap && gap.columnGap !== '0' ? declaration('column-gap', gap.columnGap) : null,
  ].filter((line): line is string => line !== null)
}

function areaBlock(areas: string[]): string {
  const rows = areas.filter((row) => row.trim()).map((row) => `    "${row.trim()}"`)
  return `  grid-template-areas:\n${rows.join('\n')};`
}

function rule(selector: string, lines: (string | null)[]): string | null {
  const body = lines.filter((line): line is string => line !== null)
  if (body.length === 0) return null
  return `${selector} {\n${body.join('\n')}\n}`
}

function subgridRule(item: LayoutItemState): string | null {
  if (!item.subgrid.enabled) return null

  const { columnsSubgrid, rowsSubgrid, columns, rows } = item.subgrid
  const columnValue = columnsSubgrid ? 'subgrid' : formatTrackList(columns)
  const rowValue = rowsSubgrid ? 'subgrid' : formatTrackList(rows)

  return rule(`.${CONTAINER_CLASS} > .${item.name}`, [
    declaration('display', 'grid'),
    columnValue ? declaration('grid-template-columns', columnValue) : null,
    rowValue ? declaration('grid-template-rows', rowValue) : null,
  ])
}

function gridItemRule(item: LayoutItemState, useAreas: boolean): string | null {
  const placement = useAreas
    ? [declaration('grid-area', item.name)]
    : [
        item.column ? declaration('grid-column', item.column) : null,
        item.row ? declaration('grid-row', item.row) : null,
      ]

  return rule(`.${CONTAINER_CLASS} > .${item.name}`, [
    ...placement,
    optional('justify-self', item.justifySelf, 'auto'),
    optional('align-self', item.alignSelf, 'auto'),
  ])
}

export function gridCss(state: BuilderState): string {
  const { grid, items } = state

  const container = rule(`.${CONTAINER_CLASS}`, [
    declaration('display', 'grid'),
    formatTrackList(grid.columns)
      ? declaration('grid-template-columns', formatTrackList(grid.columns))
      : null,
    formatTrackList(grid.rows)
      ? declaration('grid-template-rows', formatTrackList(grid.rows))
      : null,
    grid.useAreas && grid.areas.some((row) => row.trim()) ? areaBlock(grid.areas) : null,
    ...gapDeclarations(grid),
    optional('justify-content', grid.justifyContent, 'stretch'),
    optional('align-content', grid.alignContent, 'stretch'),
    optional('justify-items', grid.justifyItems, 'stretch'),
    optional('align-items', grid.alignItems, 'stretch'),
  ])

  /* Subgrid replaces the item rule rather than adding to it: a subgrid item is
     both a child and a container, and merging the two would emit grid-area twice. */
  const itemRules = items.map((item) =>
    item.subgrid.enabled
      ? [gridItemRule(item, grid.useAreas), subgridRule(item)]
          .filter((block): block is string => block !== null)
          .join('\n\n')
      : gridItemRule(item, grid.useAreas),
  )

  return [container, ...itemRules].filter(Boolean).join('\n\n')
}

export function flexCss(state: BuilderState): string {
  const { flex, items } = state

  const container = rule(`.${CONTAINER_CLASS}`, [
    declaration('display', 'flex'),
    optional('flex-direction', flex.direction, 'row'),
    optional('flex-wrap', flex.wrap, 'nowrap'),
    ...gapDeclarations(flex),
    optional('justify-content', flex.justifyContent, 'start'),
    optional('align-items', flex.alignItems, 'stretch'),
    /* align-content only does anything on a wrapping container. */
    flex.wrap === 'nowrap' ? null : optional('align-content', flex.alignContent, 'stretch'),
  ])

  const itemRules = items.map((item) =>
    rule(`.${CONTAINER_CLASS} > .${item.name}`, [
      item.flexGrow === 0 ? null : declaration('flex-grow', String(item.flexGrow)),
      item.flexShrink === 1 ? null : declaration('flex-shrink', String(item.flexShrink)),
      item.flexBasis && item.flexBasis !== 'auto'
        ? declaration('flex-basis', item.flexBasis)
        : null,
      item.order === 0 ? null : declaration('order', String(item.order)),
      optional('align-self', item.alignSelf, 'auto'),
    ]),
  )

  return [container, ...itemRules].filter(Boolean).join('\n\n')
}

export function layoutCss(state: BuilderState): string {
  return state.mode === 'grid' ? gridCss(state) : flexCss(state)
}

/* ── Tailwind v4 emission ────────────────────────────────────────────────── */

/**
 * Tailwind arbitrary values cannot contain spaces, so a track list is joined
 * with underscores — `grid-cols-[200px_1fr]`. Commas inside `minmax()` are
 * legal, but the space after them is not, hence the strip.
 */
export function toArbitrary(value: string): string {
  return value.trim().replace(/\s*,\s*/g, ',').replace(/\s+/g, '_')
}

function arbitraryGap(
  gap: { rowGap: string; columnGap: string; gapLinked: boolean },
): string[] {
  if (gap.gapLinked) {
    return gap.rowGap && gap.rowGap !== '0' ? [`gap-[${toArbitrary(gap.rowGap)}]`] : []
  }

  return [
    gap.rowGap && gap.rowGap !== '0' ? `gap-y-[${toArbitrary(gap.rowGap)}]` : '',
    gap.columnGap && gap.columnGap !== '0' ? `gap-x-[${toArbitrary(gap.columnGap)}]` : '',
  ].filter(Boolean)
}

/**
 * Tailwind ships utilities for the keyword values only, and its names diverge
 * from the CSS ones (`justify-start`, not `justify-flex-start`). Anything not in
 * this map falls through to an arbitrary property.
 */
const CONTENT_UTILITY: Record<string, string> = {
  start: 'start',
  center: 'center',
  end: 'end',
  stretch: 'stretch',
  'space-between': 'between',
  'space-around': 'around',
  'space-evenly': 'evenly',
  'flex-start': 'start',
  'flex-end': 'end',
  baseline: 'baseline',
}

function utility(prefix: string, value: string, initial: string, property: string): string {
  if (value === initial) return ''
  const suffix = CONTENT_UTILITY[value]
  return suffix ? `${prefix}-${suffix}` : `[${property}:${toArbitrary(value)}]`
}

export interface TailwindOutput {
  container: string
  items: Array<{ name: string; classes: string }>
}

export function gridTailwind(state: BuilderState): TailwindOutput {
  const { grid, items } = state
  const columns = formatTrackList(grid.columns)
  const rows = formatTrackList(grid.rows)

  const container = [
    'grid',
    columns ? `grid-cols-[${toArbitrary(columns)}]` : '',
    rows ? `grid-rows-[${toArbitrary(rows)}]` : '',
    ...arbitraryGap(grid),
    utility('justify', grid.justifyContent, 'stretch', 'justify-content'),
    utility('content', grid.alignContent, 'stretch', 'align-content'),
    utility('justify-items', grid.justifyItems, 'stretch', 'justify-items'),
    utility('items', grid.alignItems, 'stretch', 'align-items'),
  ]
    .filter(Boolean)
    .join(' ')

  return {
    container,
    items: items.map((item) => ({
      name: item.name,
      classes: [
        /* grid-template-areas has no Tailwind utility at all: named areas are a
           container-level string, so the child can only reference the name. */
        grid.useAreas ? `[grid-area:${item.name}]` : '',
        !grid.useAreas && item.column ? `col-[${toArbitrary(item.column)}]` : '',
        !grid.useAreas && item.row ? `row-[${toArbitrary(item.row)}]` : '',
        utility('justify-self', item.justifySelf, 'auto', 'justify-self'),
        utility('self', item.alignSelf, 'auto', 'align-self'),
        item.subgrid.enabled ? 'grid' : '',
        item.subgrid.enabled
          ? item.subgrid.columnsSubgrid
            ? 'grid-cols-subgrid'
            : `grid-cols-[${toArbitrary(formatTrackList(item.subgrid.columns))}]`
          : '',
        item.subgrid.enabled
          ? item.subgrid.rowsSubgrid
            ? 'grid-rows-subgrid'
            : `grid-rows-[${toArbitrary(formatTrackList(item.subgrid.rows))}]`
          : '',
      ]
        .filter(Boolean)
        .join(' '),
    })),
  }
}

export function flexTailwind(state: BuilderState): TailwindOutput {
  const { flex, items } = state

  const container = [
    'flex',
    flex.direction === 'row' ? '' : `flex-${flex.direction === 'column' ? 'col' : flex.direction === 'column-reverse' ? 'col-reverse' : 'row-reverse'}`,
    flex.wrap === 'nowrap' ? '' : `flex-${flex.wrap}`,
    ...arbitraryGap(flex),
    utility('justify', flex.justifyContent, 'start', 'justify-content'),
    utility('items', flex.alignItems, 'stretch', 'align-items'),
    flex.wrap === 'nowrap' ? '' : utility('content', flex.alignContent, 'stretch', 'align-content'),
  ]
    .filter(Boolean)
    .join(' ')

  return {
    container,
    items: items.map((item) => ({
      name: item.name,
      classes: [
        item.flexGrow === 0 ? '' : `grow-[${item.flexGrow}]`,
        item.flexShrink === 1 ? '' : `shrink-[${item.flexShrink}]`,
        item.flexBasis && item.flexBasis !== 'auto' ? `basis-[${toArbitrary(item.flexBasis)}]` : '',
        item.order === 0 ? '' : `order-[${item.order}]`,
        utility('self', item.alignSelf, 'auto', 'align-self'),
      ]
        .filter(Boolean)
        .join(' '),
    })),
  }
}

export function layoutTailwind(state: BuilderState): TailwindOutput {
  return state.mode === 'grid' ? gridTailwind(state) : flexTailwind(state)
}

/** The Tailwind panel reads as markup, because that is where the classes go. */
export function tailwindMarkup(output: TailwindOutput): string {
  const children = output.items.map(
    (item) =>
      `  <div class="${[item.name, item.classes].filter(Boolean).join(' ')}">${item.name}</div>`,
  )

  return [`<div class="${output.container}">`, ...children, '</div>'].join('\n')
}
