/**
 * The pointer-session state machine behind dragging on the canvas.
 *
 * Extracted from the component on purpose. What actually broke in this feature
 * was never the DOM plumbing — it was the bookkeeping: which session is running,
 * whether a write should happen at all for this cell, and which edges a resize is
 * allowed to move. None of that needs a browser, so none of it should need a
 * mounted component to test.
 *
 * What stays in the component is the part only a browser can do: turning pointer
 * coordinates into a cell, and capturing the pointer. Both are handed in.
 */

import type { ResizeEdge } from './layout'

export interface Cell {
  row: number
  col: number
}

export interface Bounds {
  row: number
  col: number
  rowSpan: number
  colSpan: number
}

/** The slice of the store the machine is allowed to touch. */
export interface DragSurface {
  paintArea(name: string, from: Cell, to: Cell): void
  moveTo(name: string, row: number, col: number): void
  areaBounds(name: string): Bounds | null
}

export type DragSession =
  | { kind: 'paint'; name: string; anchor: Cell }
  | { kind: 'move'; name: string }
  | { kind: 'resize'; name: string; edges: ResizeEdge[]; origin: Bounds }

/**
 * The two corners a resize should produce.
 *
 * Only the edges the handle owns move, and each is clamped against its opposite,
 * so dragging the north edge past the south does not invert the region — it stops
 * at one row. The result is always expressed as two corners, which is what keeps
 * the outcome a legal `grid-template-areas` rectangle.
 */
export function resolveResize(
  origin: Bounds,
  edges: readonly ResizeEdge[],
  cell: Cell,
): { from: Cell; to: Cell } {
  const top = origin.row
  const bottom = origin.row + origin.rowSpan - 1
  const left = origin.col
  const right = origin.col + origin.colSpan - 1

  return {
    from: {
      row: edges.includes('n') ? Math.min(cell.row, bottom) : top,
      col: edges.includes('w') ? Math.min(cell.col, right) : left,
    },
    to: {
      row: edges.includes('s') ? Math.max(cell.row, top) : bottom,
      col: edges.includes('e') ? Math.max(cell.col, left) : right,
    },
  }
}

/* ── Keyboard resizing ───────────────────────────────────────────────────── */

/** How many tracks the grid has, which every clamp needs. */
export interface GridSize {
  rows: number
  cols: number
}

/**
 * One edge expressed the way CSS grid talks about it: a line number.
 *
 * This is what makes an edge handle announceable. A separator needs a value, a
 * floor and a ceiling, and "line 3 of 5" is both the truth of the model and the
 * thing a user can act on — unlike a pixel offset, which is neither.
 */
export interface EdgeRange {
  value: number
  min: number
  max: number
}

export function edgeRange(origin: Bounds, edge: ResizeEdge, limits: GridSize): EdgeRange {
  const top = origin.row
  const bottom = origin.row + origin.rowSpan - 1
  const left = origin.col
  const right = origin.col + origin.colSpan - 1

  /* Lines are 1-based and there is one more line than there are tracks. The
     floors and ceilings below are what stop an edge crossing its opposite: a
     region is never allowed to become less than one cell. */
  switch (edge) {
    case 'n':
      return { value: top + 1, min: 1, max: bottom + 1 }
    case 's':
      return { value: bottom + 2, min: top + 2, max: limits.rows + 1 }
    case 'w':
      return { value: left + 1, min: 1, max: right + 1 }
    case 'e':
      return { value: right + 2, min: left + 2, max: limits.cols + 1 }
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Steps one edge by whole lines and returns the resulting corners.
 *
 * The keyboard counterpart to `resolveResize`, which works from a pointer's cell.
 * Both funnel into the same `paintArea`, so a region shaped by arrow keys and one
 * shaped by a mouse cannot end up in different states.
 */
export function resolveEdgeStep(
  origin: Bounds,
  edge: ResizeEdge,
  delta: number,
  limits: GridSize,
): { from: Cell; to: Cell } {
  const range = edgeRange(origin, edge, limits)
  const line = clamp(range.value + delta, range.min, range.max)

  const top = origin.row
  const bottom = origin.row + origin.rowSpan - 1
  const left = origin.col
  const right = origin.col + origin.colSpan - 1

  switch (edge) {
    case 'n':
      return { from: { row: line - 1, col: left }, to: { row: bottom, col: right } }
    case 's':
      return { from: { row: top, col: left }, to: { row: line - 2, col: right } }
    case 'w':
      return { from: { row: top, col: line - 1 }, to: { row: bottom, col: right } }
    case 'e':
      return { from: { row: top, col: left }, to: { row: bottom, col: line - 2 } }
  }
}

export interface DragMachineOptions {
  /**
   * Called when a session starts and ends. The canvas uses it to drop
   * `pointer-events` on the regions for the duration: they sit above the cells,
   * so without it `elementFromPoint` returns a region the moment the pointer
   * crosses one and the drag dies mid-gesture.
   */
  onActiveChange?: (active: boolean) => void
}

export function createDragMachine(surface: DragSurface, options: DragMachineOptions = {}) {
  let session: DragSession | null = null

  /**
   * The last cell written to. This is the write guard: a drag that stays inside
   * one cell costs nothing, and a fast drag writes once per cell crossed rather
   * than once per frame. Dropping it is what would make dragging stutter.
   */
  let lastCell: string | null = null

  function key(cell: Cell): string {
    return `${cell.row}:${cell.col}`
  }

  function setActive(active: boolean) {
    options.onActiveChange?.(active)
  }

  /** Paints the anchor cell immediately, so a click with no movement still counts. */
  function startPaint(name: string, cell: Cell) {
    session = { kind: 'paint', name, anchor: cell }
    lastCell = key(cell)
    setActive(true)
    surface.paintArea(name, cell, cell)
  }

  function startMove(name: string) {
    session = { kind: 'move', name }
    lastCell = null
    setActive(true)
  }

  /** Returns false when the region has no cells to resize, leaving no session open. */
  function startResize(name: string, edges: readonly ResizeEdge[]): boolean {
    const origin = surface.areaBounds(name)
    if (!origin) return false

    session = { kind: 'resize', name, edges: [...edges], origin }
    lastCell = null
    setActive(true)
    return true
  }

  function move(cell: Cell) {
    if (!session) return

    const next = key(cell)
    if (next === lastCell) return
    lastCell = next

    if (session.kind === 'paint') {
      surface.paintArea(session.name, session.anchor, cell)
      return
    }

    if (session.kind === 'resize') {
      const { from, to } = resolveResize(session.origin, session.edges, cell)
      surface.paintArea(session.name, from, to)
      return
    }

    surface.moveTo(session.name, cell.row, cell.col)
  }

  function end() {
    if (!session) return
    session = null
    lastCell = null
    setActive(false)
  }

  return {
    startPaint,
    startMove,
    startResize,
    move,
    end,
    isActive: () => session !== null,
    current: () => session,
  }
}

export type DragMachine = ReturnType<typeof createDragMachine>
