/**
 * Starting points for the layout builder.
 *
 * A preset is a partial state, not a snippet: applying one leaves the user in
 * the builder with something to edit, which is the whole argument for this tool
 * over copying a Stack Overflow answer.
 */

import type {
  BuilderState,
  FlexState,
  GridState,
  LayoutItemState,
  LayoutMode,
  SubgridState,
} from './layout'
import { safeName } from './layout'

let sequence = 0

/** Ids are runtime-only handles for `v-for` keys and selection, never emitted. */
export function nextItemId(): number {
  sequence += 1
  return sequence
}

function defaultSubgrid(): SubgridState {
  return {
    enabled: false,
    columnsSubgrid: true,
    rowsSubgrid: false,
    columns: ['1fr', '1fr'],
    rows: ['auto'],
    childCount: 2,
  }
}

export function createItem(name: string, overrides: Partial<LayoutItemState> = {}): LayoutItemState {
  /* Subgrid is pulled out of the spread on purpose: it is the one nested object
     on an item, so spreading `overrides` wholesale would let two items share a
     single subgrid instance and edit each other. */
  const { subgrid, ...flat } = overrides

  return {
    id: nextItemId(),
    name: safeName(name),
    column: '',
    row: '',
    justifySelf: 'auto',
    alignSelf: 'auto',
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: 'auto',
    order: 0,
    ...flat,
    subgrid: { ...defaultSubgrid(), ...subgrid },
  }
}

export function defaultGrid(): GridState {
  return {
    columns: ['1fr', '1fr', '1fr'],
    rows: ['auto', 'auto'],
    columnGap: '16px',
    rowGap: '16px',
    gapLinked: true,
    areas: [],
    useAreas: false,
    justifyContent: 'stretch',
    alignContent: 'stretch',
    justifyItems: 'stretch',
    alignItems: 'stretch',
  }
}

export function defaultFlex(): FlexState {
  return {
    direction: 'row',
    wrap: 'wrap',
    justifyContent: 'start',
    alignItems: 'stretch',
    alignContent: 'stretch',
    columnGap: '16px',
    rowGap: '16px',
    gapLinked: true,
  }
}

export interface LayoutPreset {
  value: string
  label: string
  /** One line on why the layout is shaped this way, shown under the rail. */
  note: string
  mode: LayoutMode
  grid?: Partial<GridState>
  flex?: Partial<FlexState>
  items: Array<{ name: string } & Partial<LayoutItemState>>
}

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    value: 'holy-grail',
    label: 'Holy grail',
    note: 'Header and footer span the full width; the two rails hold their measure while the middle column absorbs the rest.',
    mode: 'grid',
    grid: {
      columns: ['200px', '1fr', '200px'],
      rows: ['auto', '1fr', 'auto'],
      areas: ['header header header', 'nav main aside', 'footer footer footer'],
      useAreas: true,
    },
    items: [
      { name: 'header' },
      { name: 'nav' },
      { name: 'main' },
      { name: 'aside' },
      { name: 'footer' },
    ],
  },
  {
    value: 'dashboard',
    label: 'Dashboard',
    note: 'The sidebar spans all three rows, so it stays full height without a single fixed pixel value.',
    mode: 'grid',
    grid: {
      columns: ['240px', '1fr'],
      rows: ['auto', '1fr', 'auto'],
      areas: ['sidebar header', 'sidebar main', 'sidebar footer'],
      useAreas: true,
      rowGap: '0',
      columnGap: '0',
      gapLinked: false,
    },
    items: [{ name: 'sidebar' }, { name: 'header' }, { name: 'main' }, { name: 'footer' }],
  },
  {
    value: 'card-grid',
    label: 'Card grid',
    note: 'One repeat() with auto-fill and minmax(): the column count follows the container, with no media query anywhere.',
    mode: 'grid',
    grid: {
      columns: ['repeat(auto-fill,minmax(240px,1fr))'],
      rows: ['auto'],
      useAreas: false,
      rowGap: '24px',
      columnGap: '24px',
      gapLinked: true,
    },
    items: [
      { name: 'card-one' },
      { name: 'card-two' },
      { name: 'card-three' },
      { name: 'card-four' },
      { name: 'card-five' },
      { name: 'card-six' },
    ],
  },
  {
    value: 'twelve-column',
    label: 'Twelve columns',
    note: 'The classic editorial grid. Children are placed by span, which is why this one leaves named areas off.',
    mode: 'grid',
    grid: {
      columns: ['repeat(12,minmax(0,1fr))'],
      rows: ['auto', 'auto'],
      useAreas: false,
      rowGap: '32px',
      columnGap: '32px',
      gapLinked: false,
    },
    items: [
      { name: 'lead', column: 'span 8' },
      { name: 'meta', column: 'span 4' },
      { name: 'figure', column: '1 / span 6' },
      { name: 'body', column: '7 / -1' },
    ],
  },
  {
    value: 'magazine',
    label: 'Magazine',
    note: 'Two columns of unequal weight with a rail that runs past the fold — the shape this site uses for a case study.',
    mode: 'grid',
    grid: {
      columns: ['minmax(0,2fr)', 'minmax(0,1fr)'],
      rows: ['auto', 'auto', 'auto'],
      areas: ['kicker kicker', 'feature rail', 'gallery rail'],
      useAreas: true,
      rowGap: '40px',
      columnGap: '64px',
      gapLinked: false,
      alignItems: 'start',
    },
    items: [
      { name: 'kicker' },
      {
        name: 'feature',
        /* The nod to subgrid: the feature block aligns its own two columns to
           the parent's, so a caption under the image lines up with the body. */
        subgrid: {
          enabled: true,
          columnsSubgrid: false,
          rowsSubgrid: false,
          columns: ['1fr', '1fr'],
          rows: ['auto'],
          childCount: 2,
        },
      },
      { name: 'rail' },
      { name: 'gallery' },
    ],
  },
  {
    value: 'toolbar',
    label: 'Toolbar',
    note: 'One dimension, so flex rather than grid: a title that takes the slack and controls that keep their intrinsic size.',
    mode: 'flex',
    flex: {
      direction: 'row',
      wrap: 'nowrap',
      justifyContent: 'start',
      alignItems: 'center',
      rowGap: '12px',
      columnGap: '12px',
      gapLinked: true,
    },
    items: [
      { name: 'title', flexGrow: 1 },
      { name: 'filter' },
      { name: 'sort' },
      { name: 'action' },
    ],
  },
  {
    value: 'media-object',
    label: 'Media object',
    note: 'A fixed figure beside prose that wraps. flex-basis holds the figure; the body grows into whatever is left.',
    mode: 'flex',
    flex: {
      direction: 'row',
      wrap: 'wrap',
      justifyContent: 'start',
      alignItems: 'flex-start',
      rowGap: '16px',
      columnGap: '24px',
      gapLinked: false,
    },
    items: [
      { name: 'figure', flexBasis: '180px', flexShrink: 0 },
      { name: 'body', flexGrow: 1, flexBasis: '20ch' },
    ],
  },
]

export function applyPreset(preset: LayoutPreset): BuilderState {
  return {
    mode: preset.mode,
    grid: { ...defaultGrid(), ...preset.grid },
    flex: { ...defaultFlex(), ...preset.flex },
    items: preset.items.map(({ name, ...overrides }) => createItem(name, overrides)),
    selectedId: null,
  }
}

export function createInitialState(): BuilderState {
  return applyPreset(LAYOUT_PRESETS[0]!)
}
