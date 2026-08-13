import type {
  BuilderState,
  FlexState,
  GridState,
  LayoutItemState,
  LayoutMode,
} from '~/utils/tools/layout'
import {
  countTracks,
  flexCss,
  flexTailwind,
  formatTrackList,
  gridCss,
  gridTailwind,
  parseTrackList,
  tailwindMarkup,
  uniqueName,
} from '~/utils/tools/layout'
import { areaIssues } from '~/utils/tools/layout-ai'
import { edgeRange, resolveEdgeStep } from '~/utils/tools/layout-drag'
import type { EdgeRange, GridSize } from '~/utils/tools/layout-drag'
import type { ResizeEdge } from '~/utils/tools/layout'
import {
  LAYOUT_PRESETS,
  applyPreset,
  createInitialState,
  createItem,
} from '~/utils/tools/layout-presets'
import type { LayoutPreset } from '~/utils/tools/layout-presets'

/**
 * The builder's single source of truth.
 *
 * A factory rather than a module-level singleton: the state belongs to the page
 * that mounts the builder, so two builders on one screen would not share a
 * selection, and a route change starts clean. This matches how the other tools
 * hold their state (plain refs in the page) — Pinia would be the only store in
 * the repo and buys nothing here.
 *
 * Every mutation is a named action. Components never reach into `state` to write,
 * which is what keeps the AI merge, the presets and the mouse on one code path.
 */
export function useGridFlexState() {
  const state = reactive<BuilderState>(createInitialState())

  const presetValue = ref<string>(LAYOUT_PRESETS[0]!.value)

  /* ── Derived ───────────────────────────────────────────────────────────── */

  const columnCount = computed(() => Math.max(1, countTracks(state.grid.columns)))
  const rowCount = computed(() => Math.max(1, countTracks(state.grid.rows)))

  const selectedItem = computed<LayoutItemState | null>(
    () => state.items.find((item) => item.id === state.selectedId) ?? null,
  )

  const itemNames = computed(() => state.items.map((item) => item.name))

  /** The area map as a matrix, padded to the current track counts for drawing. */
  const areaMatrix = computed<string[][]>(() =>
    Array.from({ length: rowCount.value }, (_, row) => {
      const cells = (state.grid.areas[row] ?? '').trim().split(/\s+/).filter(Boolean)
      return Array.from({ length: columnCount.value }, (_, col) => cells[col] ?? '.')
    }),
  )

  const css = computed(() => (state.mode === 'grid' ? gridCss(state) : flexCss(state)))

  const tailwind = computed(() =>
    state.mode === 'grid' ? gridTailwind(state) : flexTailwind(state),
  )

  const tailwindCode = computed(() => tailwindMarkup(tailwind.value))

  /**
   * Everything that would make the copied CSS quietly not work. Surfaced in the
   * UI rather than swallowed: a ragged area map means the browser drops
   * `grid-template-areas` entirely and the layout silently collapses.
   */
  const warnings = computed<string[]>(() => {
    if (state.mode !== 'grid' || !state.grid.useAreas) return []

    const issues = areaIssues(state.grid.areas)
    const placed = new Set(state.grid.areas.flatMap((row) => row.trim().split(/\s+/)))
    const unplaced = state.items.filter((item) => !placed.has(item.name)).map((item) => item.name)

    return [
      ...issues,
      unplaced.length > 0
        ? `${unplaced.join(', ')} ${unplaced.length === 1 ? 'has' : 'have'} no cell in the map, so ${unplaced.length === 1 ? 'it is' : 'they are'} auto-placed.`
        : '',
    ].filter(Boolean)
  })

  /* ── Area map ──────────────────────────────────────────────────────────── */

  function writeMatrix(matrix: string[][]) {
    state.grid.areas = matrix.map((row) => row.join(' '))
  }

  /** Keeps the stored map rectangular after a track is added or removed. */
  function normaliseAreas() {
    if (!state.grid.useAreas) return
    writeMatrix(areaMatrix.value)
  }

  /**
   * Assigns a rectangle of cells to one area name. Rectangular by construction,
   * which is the point: `grid-template-areas` only accepts rectangles, so the
   * interaction cannot express an invalid map in the first place.
   */
  function paintArea(
    name: string,
    from: { row: number; col: number },
    to: { row: number; col: number },
  ) {
    const matrix = areaMatrix.value.map((row) => [...row])

    const rowStart = Math.min(from.row, to.row)
    const rowEnd = Math.max(from.row, to.row)
    const colStart = Math.min(from.col, to.col)
    const colEnd = Math.max(from.col, to.col)

    /* The name is cleared everywhere first, so dragging a region moves it rather
       than leaving an L-shaped remnant behind. */
    for (const row of matrix) {
      for (let col = 0; col < row.length; col += 1) {
        if (row[col] === name) row[col] = '.'
      }
    }

    for (let row = rowStart; row <= rowEnd; row += 1) {
      for (let col = colStart; col <= colEnd; col += 1) {
        if (matrix[row]) matrix[row]![col] = name
      }
    }

    writeMatrix(matrix)
  }

  function clearArea(name: string) {
    writeMatrix(areaMatrix.value.map((row) => row.map((cell) => (cell === name ? '.' : cell))))
  }

  /** Where an item currently sits, used to seed span steppers and drag offsets. */
  function areaBounds(name: string): { row: number; col: number; rowSpan: number; colSpan: number } | null {
    let minRow = Infinity
    let maxRow = -Infinity
    let minCol = Infinity
    let maxCol = -Infinity

    areaMatrix.value.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell !== name) return
        minRow = Math.min(minRow, rowIndex)
        maxRow = Math.max(maxRow, rowIndex)
        minCol = Math.min(minCol, colIndex)
        maxCol = Math.max(maxCol, colIndex)
      })
    })

    if (minRow === Infinity) return null
    return { row: minRow, col: minCol, rowSpan: maxRow - minRow + 1, colSpan: maxCol - minCol + 1 }
  }

  /** Grows or shrinks an item's region from its own top-left corner. */
  function setSpan(name: string, rowSpan: number, colSpan: number) {
    const bounds = areaBounds(name)
    const origin = bounds ?? { row: 0, col: 0 }

    const rows = Math.min(Math.max(1, rowSpan), rowCount.value - origin.row)
    const cols = Math.min(Math.max(1, colSpan), columnCount.value - origin.col)

    paintArea(name, origin, { row: origin.row + rows - 1, col: origin.col + cols - 1 })
  }

  const gridSize = computed<GridSize>(() => ({ rows: rowCount.value, cols: columnCount.value }))

  /**
   * Steps one edge of a region by whole grid lines.
   *
   * The keyboard's way in to resizing, and it lands on the same `paintArea` a
   * mouse drag does — so the two cannot disagree about what a region became.
   */
  function resizeEdge(name: string, edge: ResizeEdge, delta: number) {
    const origin = areaBounds(name)
    if (!origin) return

    const { from, to } = resolveEdgeStep(origin, edge, delta, gridSize.value)
    paintArea(name, from, to)
  }

  /** The line number an edge sits on, with its legal range, for the handle's ARIA. */
  function edgeInfo(name: string, edge: ResizeEdge): EdgeRange | null {
    const origin = areaBounds(name)
    return origin ? edgeRange(origin, edge, gridSize.value) : null
  }

  /** Moves a region by whole cells, clamped to the grid. Used by drag and by arrow keys. */
  function nudge(name: string, rowDelta: number, colDelta: number) {
    const bounds = areaBounds(name)
    if (!bounds) return

    const row = Math.min(
      Math.max(0, bounds.row + rowDelta),
      Math.max(0, rowCount.value - bounds.rowSpan),
    )
    const col = Math.min(
      Math.max(0, bounds.col + colDelta),
      Math.max(0, columnCount.value - bounds.colSpan),
    )

    if (row === bounds.row && col === bounds.col) return

    paintArea(name, { row, col }, { row: row + bounds.rowSpan - 1, col: col + bounds.colSpan - 1 })
  }

  /** Moves a region's top-left to an absolute cell. Drag calls this per cell crossed, not per frame. */
  function moveTo(name: string, row: number, col: number) {
    const bounds = areaBounds(name)
    if (!bounds) return
    if (bounds.row === row && bounds.col === col) return
    nudge(name, row - bounds.row, col - bounds.col)
  }

  /* ── Tracks ────────────────────────────────────────────────────────────── */

  const columnsRaw = computed(() => formatTrackList(state.grid.columns))
  const rowsRaw = computed(() => formatTrackList(state.grid.rows))

  /** The advanced input's write path. Keeps the stepper UI in sync by construction. */
  function setColumnsRaw(raw: string) {
    state.grid.columns = parseTrackList(raw)
    normaliseAreas()
  }

  function setRowsRaw(raw: string) {
    state.grid.rows = parseTrackList(raw)
    normaliseAreas()
  }

  function setTrack(axis: 'columns' | 'rows', index: number, value: string) {
    const tracks = [...state.grid[axis]]
    if (index < 0 || index >= tracks.length) return
    tracks[index] = value.trim() || 'auto'
    state.grid[axis] = tracks
  }

  function addTrack(axis: 'columns' | 'rows') {
    state.grid[axis] = [...state.grid[axis], axis === 'columns' ? '1fr' : 'auto']
    normaliseAreas()
  }

  function removeTrack(axis: 'columns' | 'rows', index: number) {
    if (state.grid[axis].length <= 1) return
    state.grid[axis] = state.grid[axis].filter((_, i) => i !== index)
    normaliseAreas()
  }

  /* ── Container ─────────────────────────────────────────────────────────── */

  function setMode(mode: LayoutMode) {
    /* Items are shared between modes by design: switching is how people compare
       the two, and losing the items would make that comparison useless. */
    state.mode = mode
    state.selectedId = null
  }

  function setGridValue<K extends keyof GridState>(key: K, value: GridState[K]) {
    state.grid[key] = value
  }

  function setFlexValue<K extends keyof FlexState>(key: K, value: FlexState[K]) {
    state.flex[key] = value
  }

  function setGap(axis: 'rowGap' | 'columnGap', value: string) {
    const target = state.mode === 'grid' ? state.grid : state.flex
    target[axis] = value
    if (target.gapLinked) {
      target.rowGap = value
      target.columnGap = value
    }
  }

  function toggleGapLink() {
    const target = state.mode === 'grid' ? state.grid : state.flex
    target.gapLinked = !target.gapLinked
    if (target.gapLinked) target.columnGap = target.rowGap
  }

  function toggleAreas() {
    state.grid.useAreas = !state.grid.useAreas
    if (!state.grid.useAreas) return

    /* First time in: seed one cell per item so the map is never an empty screen
       the user has to decode. */
    if (state.grid.areas.length === 0) {
      const matrix = Array.from({ length: rowCount.value }, () =>
        Array.from({ length: columnCount.value }, () => '.'),
      )

      state.items.forEach((item, index) => {
        const row = Math.floor(index / columnCount.value)
        const col = index % columnCount.value
        if (matrix[row]) matrix[row]![col] = item.name
      })

      writeMatrix(matrix)
      return
    }

    normaliseAreas()
  }

  /* ── Items ─────────────────────────────────────────────────────────────── */

  function select(id: number | null) {
    state.selectedId = id
  }

  /**
   * `place: false` is for drag-to-create on the canvas: the drag itself decides
   * the region, so auto-placing first would paint a cell and then immediately
   * move it. Returns the item because the caller usually needs its name.
   */
  function addItem(options: { place?: boolean } = {}): LayoutItemState {
    const item = createItem(uniqueName(`item-${state.items.length + 1}`, itemNames.value))
    state.items = [...state.items, item]
    state.selectedId = item.id

    const place = options.place ?? true

    if (place && state.mode === 'grid' && state.grid.useAreas) {
      /* A new item with no cell would be invisible in areas mode. Give it the
         first free cell, or leave it auto-placed if the map is full. */
      const matrix = areaMatrix.value
      for (let row = 0; row < matrix.length; row += 1) {
        const col = matrix[row]!.indexOf('.')
        if (col !== -1) {
          paintArea(item.name, { row, col }, { row, col })
          break
        }
      }
    }

    return item
  }

  function removeItem(id: number) {
    const item = state.items.find((entry) => entry.id === id)
    if (!item) return

    clearArea(item.name)
    state.items = state.items.filter((entry) => entry.id !== id)
    if (state.selectedId === id) state.selectedId = null
  }

  function updateItem<K extends keyof LayoutItemState>(
    id: number,
    key: K,
    value: LayoutItemState[K],
  ) {
    const item = state.items.find((entry) => entry.id === id)
    if (!item) return
    item[key] = value
  }

  function renameItem(id: number, raw: string) {
    const item = state.items.find((entry) => entry.id === id)
    if (!item) return

    const taken = state.items.filter((entry) => entry.id !== id).map((entry) => entry.name)
    const next = uniqueName(raw, taken)
    if (next === item.name) return

    const previous = item.name
    item.name = next
    /* The area map stores names, not ids, so it has to follow a rename or the
       item silently loses its cells. */
    writeMatrix(areaMatrix.value.map((row) => row.map((cell) => (cell === previous ? next : cell))))
  }

  function toggleSubgrid(id: number) {
    const item = state.items.find((entry) => entry.id === id)
    if (!item) return
    item.subgrid.enabled = !item.subgrid.enabled
  }

  /* ── Presets and AI ────────────────────────────────────────────────────── */

  function usePreset(value: string) {
    const preset = LAYOUT_PRESETS.find((entry) => entry.value === value)
    if (!preset) return
    presetValue.value = value
    replace(applyPreset(preset))
  }

  const activePreset = computed<LayoutPreset | undefined>(() =>
    LAYOUT_PRESETS.find((entry) => entry.value === presetValue.value),
  )

  /** The one wholesale write. Used by presets and by accepting an AI suggestion. */
  function replace(next: BuilderState) {
    state.mode = next.mode
    state.grid = next.grid
    state.flex = next.flex
    state.items = next.items
    state.selectedId = next.selectedId
  }

  /** A detached copy, so a preview can be rendered without touching live state. */
  function snapshot(): BuilderState {
    return structuredClone(toRaw(state))
  }

  return {
    state,
    presetValue,
    activePreset,
    columnCount,
    rowCount,
    columnsRaw,
    rowsRaw,
    areaMatrix,
    areaBounds,
    gridSize,
    resizeEdge,
    edgeInfo,
    selectedItem,
    itemNames,
    css,
    tailwind,
    tailwindCode,
    warnings,
    setMode,
    setGridValue,
    setFlexValue,
    setColumnsRaw,
    setRowsRaw,
    setTrack,
    addTrack,
    removeTrack,
    setGap,
    toggleGapLink,
    toggleAreas,
    paintArea,
    clearArea,
    setSpan,
    nudge,
    moveTo,
    select,
    addItem,
    removeItem,
    updateItem,
    renameItem,
    toggleSubgrid,
    usePreset,
    replace,
    snapshot,
  }
}

export type GridFlexStore = ReturnType<typeof useGridFlexState>
