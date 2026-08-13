import { describe, expect, it, vi } from 'vitest'
import type { Bounds, Cell, DragSurface, GridSize } from './layout-drag'
import { createDragMachine, edgeRange, resolveEdgeStep, resolveResize } from './layout-drag'

/**
 * A surface that records calls and keeps just enough state for `areaBounds`,
 * standing in for the store. The store's own painting is covered in
 * layout.test.ts; what matters here is which calls the machine makes, and how
 * many.
 */
function surface(bounds: Bounds | null = { row: 1, col: 1, rowSpan: 1, colSpan: 1 }) {
  const paintArea = vi.fn()
  const moveTo = vi.fn()

  const impl: DragSurface = {
    paintArea,
    moveTo,
    areaBounds: () => bounds,
  }

  return { impl, paintArea, moveTo }
}

const cell = (row: number, col: number): Cell => ({ row, col })

describe('resolveResize', () => {
  const origin: Bounds = { row: 1, col: 1, rowSpan: 2, colSpan: 2 }

  it('moves only the edge the handle owns', () => {
    expect(resolveResize(origin, ['e'], cell(0, 5))).toEqual({
      from: { row: 1, col: 1 },
      to: { row: 2, col: 5 },
    })
  })

  it('moves the west edge without touching the east', () => {
    expect(resolveResize(origin, ['w'], cell(9, 0))).toEqual({
      from: { row: 1, col: 0 },
      to: { row: 2, col: 2 },
    })
  })

  it('moves two edges at once for a corner handle', () => {
    expect(resolveResize(origin, ['s', 'e'], cell(4, 4))).toEqual({
      from: { row: 1, col: 1 },
      to: { row: 4, col: 4 },
    })
  })

  it('refuses to invert a region dragged past its opposite edge', () => {
    /* North dragged below the south edge collapses to one row rather than
       producing a negative span. */
    expect(resolveResize(origin, ['n'], cell(9, 0))).toEqual({
      from: { row: 2, col: 1 },
      to: { row: 2, col: 2 },
    })
  })

  it('refuses to invert horizontally either', () => {
    expect(resolveResize(origin, ['e'], cell(0, 0))).toEqual({
      from: { row: 1, col: 1 },
      to: { row: 2, col: 1 },
    })
  })

  it('leaves a region alone when no edges are given', () => {
    expect(resolveResize(origin, [], cell(7, 7))).toEqual({
      from: { row: 1, col: 1 },
      to: { row: 2, col: 2 },
    })
  })
})

/**
 * Line numbers are 1-based and there is one more line than there are tracks, so
 * every one of these is an off-by-one waiting to happen. A region at rows 2-3 of
 * a four-row grid has its top edge on line 2 and its bottom edge on line 4.
 */
describe('edgeRange', () => {
  const limits: GridSize = { rows: 4, cols: 4 }
  const origin: Bounds = { row: 1, col: 1, rowSpan: 2, colSpan: 2 }

  it('puts the top edge on its own line, floored at the first line', () => {
    expect(edgeRange(origin, 'n', limits)).toEqual({ value: 2, min: 1, max: 3 })
  })

  it('puts the bottom edge on the line after the last cell', () => {
    expect(edgeRange(origin, 's', limits)).toEqual({ value: 4, min: 3, max: 5 })
  })

  it('mirrors that for the left edge', () => {
    expect(edgeRange(origin, 'w', limits)).toEqual({ value: 2, min: 1, max: 3 })
  })

  it('mirrors that for the right edge', () => {
    expect(edgeRange(origin, 'e', limits)).toEqual({ value: 4, min: 3, max: 5 })
  })

  it('leaves a single-cell region no room to collapse further', () => {
    const single: Bounds = { row: 0, col: 0, rowSpan: 1, colSpan: 1 }

    /* min equals max on the north edge: the only legal position is where it is,
       because moving it down would leave a region of no rows. */
    expect(edgeRange(single, 'n', limits)).toEqual({ value: 1, min: 1, max: 1 })
    expect(edgeRange(single, 's', limits)).toEqual({ value: 2, min: 2, max: 5 })
  })

  it('caps an edge at the last line of the grid', () => {
    const full: Bounds = { row: 0, col: 0, rowSpan: 4, colSpan: 4 }

    expect(edgeRange(full, 's', limits).value).toBe(5)
    expect(edgeRange(full, 's', limits).max).toBe(5)
  })
})

describe('resolveEdgeStep', () => {
  const limits: GridSize = { rows: 4, cols: 4 }
  const origin: Bounds = { row: 1, col: 1, rowSpan: 2, colSpan: 2 }

  it('grows the east edge by one column', () => {
    expect(resolveEdgeStep(origin, 'e', 1, limits)).toEqual({
      from: { row: 1, col: 1 },
      to: { row: 2, col: 3 },
    })
  })

  it('shrinks the east edge by one column', () => {
    expect(resolveEdgeStep(origin, 'e', -1, limits)).toEqual({
      from: { row: 1, col: 1 },
      to: { row: 2, col: 1 },
    })
  })

  it('raises the north edge without moving the south', () => {
    expect(resolveEdgeStep(origin, 'n', -1, limits)).toEqual({
      from: { row: 0, col: 1 },
      to: { row: 2, col: 2 },
    })
  })

  it('stops the north edge at the first line', () => {
    expect(resolveEdgeStep(origin, 'n', -9, limits).from.row).toBe(0)
  })

  it('stops the south edge at the last line', () => {
    expect(resolveEdgeStep(origin, 's', 9, limits).to.row).toBe(3)
  })

  it('never collapses a region below one cell', () => {
    const { from, to } = resolveEdgeStep(origin, 'n', 9, limits)

    expect(to.row - from.row).toBe(0)
    expect(from.row).toBe(2)
  })

  it('never collapses a region below one column either', () => {
    const { from, to } = resolveEdgeStep(origin, 'e', -9, limits)

    expect(to.col - from.col).toBe(0)
  })

  it('is a no-op for a zero step', () => {
    expect(resolveEdgeStep(origin, 'e', 0, limits)).toEqual({
      from: { row: 1, col: 1 },
      to: { row: 2, col: 2 },
    })
  })

  it('agrees with a mouse resize that lands on the same cell', () => {
    /* The keyboard and the pointer must not be able to produce different regions.
       Stepping the east edge one column right is the same as dragging it to
       column 3. */
    expect(resolveEdgeStep(origin, 'e', 1, limits)).toEqual(
      resolveResize(origin, ['e'], { row: 0, col: 3 }),
    )
  })
})

describe('createDragMachine — paint', () => {
  it('paints the anchor cell immediately, so a click with no movement counts', () => {
    const { impl, paintArea } = surface()
    const drag = createDragMachine(impl)

    drag.startPaint('main', cell(0, 0))

    expect(paintArea).toHaveBeenCalledWith('main', { row: 0, col: 0 }, { row: 0, col: 0 })
  })

  it('paints the rectangle from the anchor to the current cell', () => {
    const { impl, paintArea } = surface()
    const drag = createDragMachine(impl)

    drag.startPaint('main', cell(0, 0))
    drag.move(cell(2, 3))

    expect(paintArea).toHaveBeenLastCalledWith('main', { row: 0, col: 0 }, { row: 2, col: 3 })
  })

  it('keeps the anchor fixed as the pointer wanders', () => {
    const { impl, paintArea } = surface()
    const drag = createDragMachine(impl)

    drag.startPaint('main', cell(1, 1))
    drag.move(cell(2, 2))
    drag.move(cell(0, 0))

    expect(paintArea).toHaveBeenLastCalledWith('main', { row: 1, col: 1 }, { row: 0, col: 0 })
  })
})

describe('createDragMachine — the write guard', () => {
  it('does not write again while the pointer stays in one cell', () => {
    const { impl, moveTo } = surface()
    const drag = createDragMachine(impl)

    drag.startMove('main')
    drag.move(cell(1, 1))
    drag.move(cell(1, 1))
    drag.move(cell(1, 1))

    /* Three moves inside one cell, one write. Without this the store is written
       on every pointer event and dragging stutters. */
    expect(moveTo).toHaveBeenCalledTimes(1)
  })

  it('writes once per cell crossed', () => {
    const { impl, moveTo } = surface()
    const drag = createDragMachine(impl)

    drag.startMove('main')
    drag.move(cell(0, 0))
    drag.move(cell(0, 1))
    drag.move(cell(0, 2))

    expect(moveTo).toHaveBeenCalledTimes(3)
    expect(moveTo).toHaveBeenLastCalledWith('main', 0, 2)
  })

  it('writes again when the pointer returns to a cell it just left', () => {
    const { impl, moveTo } = surface()
    const drag = createDragMachine(impl)

    drag.startMove('main')
    drag.move(cell(0, 0))
    drag.move(cell(0, 1))
    drag.move(cell(0, 0))

    expect(moveTo).toHaveBeenCalledTimes(3)
  })

  it('ignores moves when no session is running', () => {
    const { impl, moveTo, paintArea } = surface()
    const drag = createDragMachine(impl)

    drag.move(cell(0, 0))

    expect(moveTo).not.toHaveBeenCalled()
    expect(paintArea).not.toHaveBeenCalled()
  })

  it('ignores moves after the session ends', () => {
    const { impl, moveTo } = surface()
    const drag = createDragMachine(impl)

    drag.startMove('main')
    drag.move(cell(0, 0))
    drag.end()
    drag.move(cell(5, 5))

    expect(moveTo).toHaveBeenCalledTimes(1)
  })
})

/**
 * The regression that started this: regions are stacked above the cells, so while
 * a drag is running they have to stop taking pointer events or `elementFromPoint`
 * returns a region and the gesture dies as soon as it crosses one. The canvas
 * binds `pointer-events: none` to this callback, so these tests cover the fix
 * itself rather than Vue's class binding.
 */
describe('createDragMachine — the active flag', () => {
  it('reports active for the length of a paint session', () => {
    const changes: boolean[] = []
    const { impl } = surface()
    const drag = createDragMachine(impl, { onActiveChange: (v) => changes.push(v) })

    expect(drag.isActive()).toBe(false)

    drag.startPaint('main', cell(0, 0))
    expect(drag.isActive()).toBe(true)

    drag.end()
    expect(drag.isActive()).toBe(false)
    expect(changes).toEqual([true, false])
  })

  it('reports active for a move session', () => {
    const changes: boolean[] = []
    const { impl } = surface()
    const drag = createDragMachine(impl, { onActiveChange: (v) => changes.push(v) })

    drag.startMove('main')
    drag.end()

    expect(changes).toEqual([true, false])
  })

  it('reports active for a resize session', () => {
    const changes: boolean[] = []
    const { impl } = surface()
    const drag = createDragMachine(impl, { onActiveChange: (v) => changes.push(v) })

    drag.startResize('main', ['s', 'e'])
    drag.end()

    expect(changes).toEqual([true, false])
  })

  it('does not announce a second end, so the flag cannot be cleared twice', () => {
    const changes: boolean[] = []
    const { impl } = surface()
    const drag = createDragMachine(impl, { onActiveChange: (v) => changes.push(v) })

    drag.startMove('main')
    drag.end()
    drag.end()

    expect(changes).toEqual([true, false])
  })

  it('stays inactive when a resize cannot start', () => {
    const changes: boolean[] = []
    const { impl } = surface(null)
    const drag = createDragMachine(impl, { onActiveChange: (v) => changes.push(v) })

    expect(drag.startResize('ghost', ['e'])).toBe(false)
    expect(drag.isActive()).toBe(false)
    expect(changes).toEqual([])
  })
})

describe('createDragMachine — resize', () => {
  it('resizes from the bounds captured at the start, not the live ones', () => {
    const { impl, paintArea } = surface({ row: 0, col: 0, rowSpan: 1, colSpan: 1 })
    const drag = createDragMachine(impl)

    drag.startResize('main', ['s', 'e'])
    drag.move(cell(2, 2))
    drag.move(cell(1, 1))

    /* The second move is measured from the original single cell, so pulling the
       handle back shrinks the region instead of compounding the first drag. */
    expect(paintArea).toHaveBeenLastCalledWith('main', { row: 0, col: 0 }, { row: 1, col: 1 })
  })

  it('does not paint when the resize never started', () => {
    const { impl, paintArea } = surface(null)
    const drag = createDragMachine(impl)

    drag.startResize('ghost', ['e'])
    drag.move(cell(3, 3))

    expect(paintArea).not.toHaveBeenCalled()
  })
})

describe('createDragMachine — session isolation', () => {
  it('a move session never paints', () => {
    const { impl, paintArea } = surface()
    const drag = createDragMachine(impl)

    drag.startMove('main')
    drag.move(cell(2, 2))

    expect(paintArea).not.toHaveBeenCalled()
  })

  it('a paint session never calls moveTo', () => {
    const { impl, moveTo } = surface()
    const drag = createDragMachine(impl)

    drag.startPaint('main', cell(0, 0))
    drag.move(cell(2, 2))

    expect(moveTo).not.toHaveBeenCalled()
  })

  it('starting a new session replaces the old one', () => {
    const { impl, paintArea, moveTo } = surface()
    const drag = createDragMachine(impl)

    drag.startMove('main')
    drag.startPaint('aside', cell(1, 1))
    drag.move(cell(2, 2))

    expect(moveTo).not.toHaveBeenCalled()
    expect(paintArea).toHaveBeenLastCalledWith('aside', { row: 1, col: 1 }, { row: 2, col: 2 })
  })
})
