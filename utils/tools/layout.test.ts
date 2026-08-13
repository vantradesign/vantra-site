import { describe, expect, it } from 'vitest'
import {
  countTracks,
  expandTracks,
  flexCss,
  flexTailwind,
  formatTrackList,
  gridCss,
  gridTailwind,
  parseTrackList,
  safeName,
  tailwindMarkup,
  toArbitrary,
  uniqueName,
} from './layout'
import type { BuilderState } from './layout'
import { applyPreset, createItem, defaultFlex, defaultGrid, LAYOUT_PRESETS } from './layout-presets'

function state(overrides: Partial<BuilderState> = {}): BuilderState {
  return {
    mode: 'grid',
    grid: defaultGrid(),
    flex: defaultFlex(),
    items: [],
    selectedId: null,
    ...overrides,
  }
}

describe('parseTrackList', () => {
  it('splits on top-level whitespace', () => {
    expect(parseTrackList('200px 1fr auto')).toEqual(['200px', '1fr', 'auto'])
  })

  it('keeps a function call as one track', () => {
    expect(parseTrackList('minmax(200px, 1fr) 1fr')).toEqual(['minmax(200px,1fr)', '1fr'])
  })

  it('keeps nested functions together', () => {
    expect(parseTrackList('repeat(auto-fill, minmax(240px, 1fr))')).toEqual([
      'repeat(auto-fill,minmax(240px,1fr))',
    ])
  })

  it('collapses irregular whitespace', () => {
    expect(parseTrackList('  1fr\n  2fr   ')).toEqual(['1fr', '2fr'])
  })

  it('round-trips through formatTrackList', () => {
    const raw = '200px minmax(10rem,1fr) auto'
    expect(formatTrackList(parseTrackList(raw))).toBe(raw)
  })

  it('returns nothing for an empty string', () => {
    expect(parseTrackList('   ')).toEqual([])
  })
})

describe('countTracks', () => {
  it('counts plain tracks', () => {
    expect(countTracks(['1fr', '1fr', 'auto'])).toBe(3)
  })

  it('expands an integer repeat()', () => {
    expect(countTracks(['repeat(12,1fr)'])).toBe(12)
  })

  it('multiplies a repeat() with several tracks in its pattern', () => {
    expect(countTracks(['repeat(3,1fr 2fr)'])).toBe(6)
  })

  it('counts an auto-fill repeat() as its pattern, since the real count needs a container', () => {
    expect(countTracks(['repeat(auto-fill,minmax(240px,1fr))'])).toBe(1)
  })

  it('adds repeats to their neighbours', () => {
    expect(countTracks(['200px', 'repeat(2,1fr)'])).toBe(3)
  })
})

describe('expandTracks', () => {
  it('leaves plain tracks alone', () => {
    expect(expandTracks(['200px', '1fr'])).toEqual(['200px', '1fr'])
  })

  it('expands an integer repeat() into one value per column, for the ruler', () => {
    expect(expandTracks(['repeat(3,1fr)'])).toEqual(['1fr', '1fr', '1fr'])
  })

  it('repeats a multi-track pattern in order', () => {
    expect(expandTracks(['repeat(2,1fr 2fr)'])).toEqual(['1fr', '2fr', '1fr', '2fr'])
  })

  it('lists an auto-fill pattern once, since the real count needs a container', () => {
    expect(expandTracks(['repeat(auto-fill,minmax(240px,1fr))'])).toEqual(['minmax(240px,1fr)'])
  })

  it('keeps neighbours around a repeat()', () => {
    expect(expandTracks(['200px', 'repeat(2,1fr)', 'auto'])).toEqual([
      '200px',
      '1fr',
      '1fr',
      'auto',
    ])
  })

  it('agrees with countTracks, which is derived from it', () => {
    const tracks = ['200px', 'repeat(4,1fr 2fr)']
    expect(expandTracks(tracks)).toHaveLength(countTracks(tracks))
  })
})

describe('safeName and uniqueName', () => {
  it('makes an identifier out of arbitrary text', () => {
    expect(safeName('Main Content!')).toBe('main-content')
  })

  it('prefixes a leading digit, because .2col is not a selector', () => {
    expect(safeName('2 columns')).toBe('area-2-columns')
  })

  it('falls back when nothing usable is left', () => {
    expect(safeName('   ***  ')).toBe('item')
  })

  it('suffixes a name that is already taken', () => {
    expect(uniqueName('main', ['main'])).toBe('main-2')
    expect(uniqueName('main', ['main', 'main-2'])).toBe('main-3')
  })

  it('leaves a free name alone', () => {
    expect(uniqueName('aside', ['main'])).toBe('aside')
  })
})

describe('gridCss', () => {
  it('emits the container with tracks and a linked gap shorthand', () => {
    const css = gridCss(
      state({
        grid: { ...defaultGrid(), columns: ['200px', '1fr'], rows: ['auto'], rowGap: '16px' },
      }),
    )

    expect(css).toContain('display: grid;')
    expect(css).toContain('grid-template-columns: 200px 1fr;')
    expect(css).toContain('grid-template-rows: auto;')
    expect(css).toContain('gap: 16px;')
  })

  it('omits properties still at their initial value', () => {
    const css = gridCss(state())

    expect(css).not.toContain('justify-content')
    expect(css).not.toContain('align-items')
  })

  it('splits the gap when it is unlinked, and drops a zero', () => {
    const css = gridCss(
      state({
        grid: { ...defaultGrid(), gapLinked: false, rowGap: '8px', columnGap: '0' },
      }),
    )

    expect(css).toContain('row-gap: 8px;')
    expect(css).not.toContain('column-gap')
    /* Anchored to the start of a declaration: 'gap: ' on its own also matches
       inside 'row-gap: 8px', which made an earlier version of this pass wrongly. */
    expect(css).not.toContain('\n  gap:')
  })

  it('quotes each row of the area map and places children by name', () => {
    const css = gridCss(
      state({
        grid: {
          ...defaultGrid(),
          columns: ['1fr', '1fr'],
          rows: ['auto', '1fr'],
          areas: ['header header', 'side main'],
          useAreas: true,
        },
        items: [createItem('header'), createItem('side'), createItem('main')],
      }),
    )

    expect(css).toContain('"header header"')
    expect(css).toContain('"side main"')
    expect(css).toContain('.layout > .header {\n  grid-area: header;\n}')
  })

  it('places children by line when areas are off', () => {
    const css = gridCss(
      state({
        items: [createItem('lead', { column: 'span 8', row: '1 / 3' })],
      }),
    )

    expect(css).toContain('grid-column: span 8;')
    expect(css).toContain('grid-row: 1 / 3;')
    expect(css).not.toContain('grid-area')
  })

  it('emits a subgrid item as both a child and a container', () => {
    const css = gridCss(
      state({
        grid: { ...defaultGrid(), areas: ['feature'], useAreas: true },
        items: [
          createItem('feature', {
            subgrid: {
              enabled: true,
              columnsSubgrid: true,
              rowsSubgrid: false,
              columns: [],
              rows: ['auto'],
              childCount: 2,
            },
          }),
        ],
      }),
    )

    expect(css).toContain('grid-area: feature;')
    expect(css).toContain('display: grid;\n  grid-template-columns: subgrid;')
    expect(css).toContain('grid-template-rows: auto;')
  })

  it('writes explicit nested tracks when the axis is not subgrid', () => {
    const css = gridCss(
      state({
        items: [
          createItem('card', {
            subgrid: {
              enabled: true,
              columnsSubgrid: false,
              rowsSubgrid: false,
              columns: ['1fr', '2fr'],
              rows: ['auto'],
              childCount: 1,
            },
          }),
        ],
      }),
    )

    expect(css).toContain('grid-template-columns: 1fr 2fr;')
    expect(css).not.toContain('subgrid')
  })

  it('emits the self-properties only when they are set', () => {
    const css = gridCss(
      state({ items: [createItem('a', { column: '1', alignSelf: 'center' })] }),
    )

    expect(css).toContain('align-self: center;')
    expect(css).not.toContain('justify-self')
  })
})

describe('flexCss', () => {
  it('emits only what differs from the initial value', () => {
    const css = flexCss(
      state({
        mode: 'flex',
        flex: { ...defaultFlex(), direction: 'column', justifyContent: 'space-between' },
      }),
    )

    expect(css).toContain('display: flex;')
    expect(css).toContain('flex-direction: column;')
    expect(css).toContain('justify-content: space-between;')
    expect(css).not.toContain('align-items')
  })

  it('leaves align-content out while the container cannot wrap', () => {
    const css = flexCss(
      state({
        mode: 'flex',
        flex: { ...defaultFlex(), wrap: 'nowrap', alignContent: 'center' },
      }),
    )

    expect(css).not.toContain('align-content')
  })

  it('keeps align-content once the container wraps', () => {
    const css = flexCss(
      state({
        mode: 'flex',
        flex: { ...defaultFlex(), wrap: 'wrap', alignContent: 'center' },
      }),
    )

    expect(css).toContain('align-content: center;')
  })

  it('emits item properties that are off their defaults', () => {
    const css = flexCss(
      state({
        mode: 'flex',
        items: [
          createItem('figure', { flexShrink: 0, flexBasis: '180px' }),
          createItem('body', { flexGrow: 1, order: -1 }),
        ],
      }),
    )

    expect(css).toContain('.layout > .figure {')
    expect(css).toContain('flex-shrink: 0;')
    expect(css).toContain('flex-basis: 180px;')
    expect(css).toContain('flex-grow: 1;')
    expect(css).toContain('order: -1;')
  })

  it('writes no rule for an item that is entirely default', () => {
    const css = flexCss(state({ mode: 'flex', items: [createItem('plain')] }))
    expect(css).not.toContain('.layout > .plain')
  })
})

describe('toArbitrary', () => {
  it('joins a track list with underscores, since Tailwind values cannot hold spaces', () => {
    expect(toArbitrary('200px 1fr')).toBe('200px_1fr')
  })

  it('strips the space after a comma inside a function', () => {
    expect(toArbitrary('minmax(200px, 1fr)')).toBe('minmax(200px,1fr)')
  })
})

describe('gridTailwind', () => {
  it('emits arbitrary track lists and mapped keyword utilities', () => {
    const output = gridTailwind(
      state({
        grid: {
          ...defaultGrid(),
          columns: ['repeat(auto-fill,minmax(240px,1fr))'],
          rows: ['auto'],
          rowGap: '24px',
          justifyContent: 'space-between',
        },
      }),
    )

    expect(output.container).toContain('grid')
    expect(output.container).toContain('grid-cols-[repeat(auto-fill,minmax(240px,1fr))]')
    expect(output.container).toContain('gap-[24px]')
    expect(output.container).toContain('justify-between')
  })

  it('splits the gap axes when they are unlinked', () => {
    const output = gridTailwind(
      state({ grid: { ...defaultGrid(), gapLinked: false, rowGap: '8px', columnGap: '32px' } }),
    )

    expect(output.container).toContain('gap-y-[8px]')
    expect(output.container).toContain('gap-x-[32px]')
  })

  it('falls back to an arbitrary property for grid-area, which has no utility', () => {
    const output = gridTailwind(
      state({
        grid: { ...defaultGrid(), areas: ['main'], useAreas: true },
        items: [createItem('main')],
      }),
    )

    expect(output.items[0]?.classes).toContain('[grid-area:main]')
  })

  it('uses col- and row- utilities for line placement', () => {
    const output = gridTailwind(
      state({ items: [createItem('lead', { column: 'span 8', row: '1 / 3' })] }),
    )

    expect(output.items[0]?.classes).toContain('col-[span_8]')
    expect(output.items[0]?.classes).toContain('row-[1_/_3]')
  })

  it('emits the subgrid utilities', () => {
    const output = gridTailwind(
      state({
        items: [
          createItem('feature', {
            subgrid: {
              enabled: true,
              columnsSubgrid: true,
              rowsSubgrid: true,
              columns: [],
              rows: [],
              childCount: 0,
            },
          }),
        ],
      }),
    )

    expect(output.items[0]?.classes).toContain('grid-cols-subgrid')
    expect(output.items[0]?.classes).toContain('grid-rows-subgrid')
  })
})

describe('flexTailwind', () => {
  it('maps flex-direction to Tailwind names', () => {
    expect(
      flexTailwind(state({ mode: 'flex', flex: { ...defaultFlex(), direction: 'column' } }))
        .container,
    ).toContain('flex-col')

    expect(
      flexTailwind(
        state({ mode: 'flex', flex: { ...defaultFlex(), direction: 'column-reverse' } }),
      ).container,
    ).toContain('flex-col-reverse')
  })

  it('maps flex-start to items-start rather than items-flex-start', () => {
    const output = flexTailwind(
      state({ mode: 'flex', flex: { ...defaultFlex(), alignItems: 'flex-start' } }),
    )

    expect(output.container).toContain('items-start')
  })

  it('emits per-item grow, basis and order', () => {
    const output = flexTailwind(
      state({
        mode: 'flex',
        items: [createItem('body', { flexGrow: 1, flexBasis: '20ch', order: 2 })],
      }),
    )

    expect(output.items[0]?.classes).toBe('grow-[1] basis-[20ch] order-[2]')
  })
})

describe('tailwindMarkup', () => {
  it('reads as the markup the classes belong in', () => {
    const markup = tailwindMarkup(
      gridTailwind(
        state({
          grid: { ...defaultGrid(), columns: ['1fr'], rows: ['auto'], areas: ['main'], useAreas: true },
          items: [createItem('main')],
        }),
      ),
    )

    expect(markup.startsWith('<div class="grid')).toBe(true)
    expect(markup).toContain('<div class="main [grid-area:main]">main</div>')
    expect(markup.endsWith('</div>')).toBe(true)
  })
})

describe('presets', () => {
  it('produce valid CSS for every entry', () => {
    for (const preset of LAYOUT_PRESETS) {
      const css = preset.mode === 'grid' ? gridCss(applyPreset(preset)) : flexCss(applyPreset(preset))
      expect(css).toContain(preset.mode === 'grid' ? 'display: grid;' : 'display: flex;')
    }
  })

  it('give every item its own subgrid object, so two items cannot share one', () => {
    const applied = applyPreset(LAYOUT_PRESETS[0]!)
    expect(applied.items[0]!.subgrid).not.toBe(applied.items[1]!.subgrid)
  })

  it('give every item a unique id', () => {
    const applied = applyPreset(LAYOUT_PRESETS[0]!)
    const ids = new Set(applied.items.map((item) => item.id))
    expect(ids.size).toBe(applied.items.length)
  })
})
