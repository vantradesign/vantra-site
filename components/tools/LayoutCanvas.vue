<script setup lang="ts">
import type { BuilderState, ResizeEdge } from '~/utils/tools/layout'
import { expandTracks, formatTrackList } from '~/utils/tools/layout'
import { createDragMachine } from '~/utils/tools/layout-drag'
import type { GridFlexStore } from '~/composables/useGridFlexState'

const props = defineProps<{
  store: GridFlexStore
  /** When set, the canvas draws this instead of live state and takes no input. */
  previewState?: BuilderState | null
  /** False below tablet width, and while a suggestion is pending. */
  interactive: boolean
  /** Numbered rulers along the top and left edges. */
  showLines?: boolean
}>()

const drawn = computed<BuilderState>(() => props.previewState ?? props.store.state)
const inert = computed(() => Boolean(props.previewState) || !props.interactive)

/**
 * The cell underlay is the named-areas editor. It shares the one grid container
 * with the items — cells sit in explicit line positions, items stack above them
 * via z-index — so the two can never disagree about where a cell is.
 */
const showCells = computed(
  () => drawn.value.mode === 'grid' && drawn.value.grid.useAreas && !inert.value,
)

const containerStyle = computed(() => {
  const state = drawn.value

  if (state.mode === 'flex') {
    const { flex } = state
    return {
      display: 'flex',
      flexDirection: flex.direction,
      flexWrap: flex.wrap,
      justifyContent: flex.justifyContent,
      alignItems: flex.alignItems,
      alignContent: flex.wrap === 'nowrap' ? undefined : flex.alignContent,
      rowGap: flex.rowGap || undefined,
      columnGap: (flex.gapLinked ? flex.rowGap : flex.columnGap) || undefined,
    }
  }

  const { grid } = state
  return {
    display: 'grid',
    gridTemplateColumns: formatTrackList(grid.columns) || undefined,
    gridTemplateRows: formatTrackList(grid.rows) || undefined,
    gridTemplateAreas:
      grid.useAreas && grid.areas.some((row) => row.trim())
        ? grid.areas.map((row) => `"${row.trim()}"`).join(' ')
        : undefined,
    justifyContent: grid.justifyContent,
    alignContent: grid.alignContent,
    justifyItems: grid.justifyItems,
    alignItems: grid.alignItems,
    rowGap: grid.rowGap || undefined,
    columnGap: (grid.gapLinked ? grid.rowGap : grid.columnGap) || undefined,
  }
})

/* ── Rulers ──────────────────────────────────────────────────────────────── */

const rulersOn = computed(() => Boolean(props.showLines) && drawn.value.mode === 'grid')

const columnTracks = computed(() => expandTracks(drawn.value.grid.columns))
const rowTracks = computed(() => expandTracks(drawn.value.grid.rows))

const columnGapValue = computed(() =>
  drawn.value.grid.gapLinked ? drawn.value.grid.rowGap : drawn.value.grid.columnGap,
)

/**
 * The rulers are separate grids that repeat the container's own track list and
 * gap, which is what makes the numbers line up with the real lines — the browser
 * resolves `fr` and `minmax()` identically in both, so there is no arithmetic
 * here to get wrong. The transparent 1px side borders stand in for the canvas
 * border, without which every label would sit a pixel off.
 */
const topRulerStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: formatTrackList(drawn.value.grid.columns) || undefined,
  columnGap: columnGapValue.value || undefined,
}))

const leftRulerStyle = computed(() => ({
  display: 'grid',
  gridTemplateRows: formatTrackList(drawn.value.grid.rows) || undefined,
  rowGap: drawn.value.grid.rowGap || undefined,
}))

const frameStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: rulersOn.value ? 'auto minmax(0, 1fr)' : 'minmax(0, 1fr)',
  gridTemplateRows: rulersOn.value ? 'auto minmax(0, 1fr)' : 'minmax(0, 1fr)',
}))

/* ── Pointer session ─────────────────────────────────────────────────────── */

const root = ref<HTMLElement | null>(null)

/**
 * Regions sit above the cells, so `elementFromPoint` returns a region as soon as
 * the pointer crosses one and the drag goes dead mid-gesture. Dropping their
 * pointer events for the length of the session lets hit-testing reach the cells
 * underneath. The machine owns when that starts and stops.
 */
const dragging = ref(false)

const drag = createDragMachine(
  {
    paintArea: (name, from, to) => props.store.paintArea(name, from, to),
    moveTo: (name, row, col) => props.store.moveTo(name, row, col),
    areaBounds: (name) => props.store.areaBounds(name),
  },
  { onActiveChange: (active) => (dragging.value = active) },
)

function cellUnder(event: PointerEvent): { row: number; col: number } | null {
  const element = document.elementFromPoint(event.clientX, event.clientY)
  const cell = element?.closest<HTMLElement>('[data-cell]')
  if (!cell || !root.value?.contains(cell)) return null

  const row = Number(cell.dataset.row)
  const col = Number(cell.dataset.col)
  if (!Number.isInteger(row) || !Number.isInteger(col)) return null

  return { row, col }
}

/**
 * Dragging on the cells paints the selected region. With nothing selected it
 * creates a region instead, which is how a grid gets built from an empty map
 * without a trip to the controls first.
 */
function beginPaint(event: PointerEvent, row: number, col: number) {
  const item = props.store.selectedItem.value ?? props.store.addItem({ place: false })

  drag.startPaint(item.name, { row, col })
  ;(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId)
}

function beginMove(event: PointerEvent, name: string) {
  drag.startMove(name)
  root.value?.setPointerCapture?.(event.pointerId)
}

function beginResize(event: PointerEvent, name: string, edges: ResizeEdge[]) {
  if (drag.startResize(name, edges)) root.value?.setPointerCapture?.(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (!drag.isActive()) return

  const cell = cellUnder(event)
  if (!cell) return

  drag.move(cell)
}

function endSession() {
  drag.end()
}

/**
 * The four edge ranges for one region, handed to the item so its splitter handles
 * can announce a real value. Only computed for the selected region, since that is
 * the only one showing handles.
 */
function edgeRanges(name: string) {
  return {
    n: props.store.edgeInfo(name, 'n'),
    e: props.store.edgeInfo(name, 'e'),
    s: props.store.edgeInfo(name, 's'),
    w: props.store.edgeInfo(name, 'w'),
  }
}

function cellLabel(row: number, col: number, name: string) {
  const occupant = name === '.' ? 'empty' : name
  return `Row ${row + 1}, column ${col + 1} — ${occupant}`
}

/** Keyboard path for the area map: no drag required. */
function onCellKeydown(event: KeyboardEvent, row: number, col: number) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  const item = props.store.selectedItem.value
  if (!item) return
  event.preventDefault()
  props.store.paintArea(item.name, { row, col }, { row, col })
}
</script>

<template>
  <div>
    <div :style="frameStyle">
      <!-- Empty corner where the two rulers meet. -->
      <div v-if="rulersOn" aria-hidden="true" />

      <div v-if="rulersOn" class="border-x border-transparent pb-1" aria-hidden="true">
        <div :style="topRulerStyle">
          <div
            v-for="(track, index) in columnTracks"
            :key="`col-ruler-${index}`"
            class="flex items-baseline justify-between gap-1 overflow-hidden border-l border-blue/40 pl-1"
          >
            <span class="caption text-blue">{{ index + 1 }}</span>
            <span class="caption truncate normal-case tracking-normal text-ink-faint">
              {{ track }}
            </span>
            <span v-if="index === columnTracks.length - 1" class="caption text-blue">
              {{ columnTracks.length + 1 }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="rulersOn" class="border-y border-transparent pr-2" aria-hidden="true">
        <div :style="leftRulerStyle" class="h-full">
          <div
            v-for="(track, index) in rowTracks"
            :key="`row-ruler-${index}`"
            class="flex flex-col items-end justify-between border-t border-blue/40 pt-1"
          >
            <span class="caption text-blue">{{ index + 1 }}</span>
            <span class="caption max-w-[6rem] truncate normal-case tracking-normal text-ink-faint">
              {{ track }}
            </span>
            <span v-if="index === rowTracks.length - 1" class="caption text-blue">
              {{ rowTracks.length + 1 }}
            </span>
          </div>
        </div>
      </div>

      <div
        ref="root"
        class="min-h-[22rem] border border-rule bg-paper"
        :class="rulersOn ? '' : 'p-4'"
        :style="containerStyle"
        @pointermove="onPointerMove"
        @pointerup="endSession"
        @pointercancel="endSession"
        @pointerleave="endSession"
      >
        <!-- Cells first in source order so items paint over them. -->
        <template v-if="showCells">
          <button
            v-for="cell in props.store.areaMatrix.value.flatMap((row, rowIndex) =>
              row.map((name, colIndex) => ({ name, row: rowIndex, col: colIndex })),
            )"
            :key="`${cell.row}-${cell.col}`"
            type="button"
            data-cell="true"
            :data-row="cell.row"
            :data-col="cell.col"
            :style="{ gridRow: cell.row + 1, gridColumn: cell.col + 1 }"
            class="min-h-16 border border-dashed border-rule text-ink-faint transition-colors duration-150 ease-editorial hover:border-blue"
            :aria-label="cellLabel(cell.row, cell.col, cell.name)"
            @pointerdown="beginPaint($event, cell.row, cell.col)"
            @keydown="onCellKeydown($event, cell.row, cell.col)"
          >
            <span class="caption normal-case tracking-normal" aria-hidden="true">
              {{ cell.name === '.' ? '·' : '' }}
            </span>
          </button>
        </template>

        <LayoutItem
          v-for="item in drawn.items"
          :key="item.id"
          :item="item"
          :mode="drawn.mode"
          :use-areas="drawn.grid.useAreas"
          :selected="!inert && drawn.selectedId === item.id"
          :inert="inert"
          :draggable="showCells"
          :edges="showCells && drawn.selectedId === item.id ? edgeRanges(item.name) : undefined"
          :class="dragging ? 'pointer-events-none' : ''"
          @select="props.store.select(item.id)"
          @grab="beginMove($event, item.name)"
          @nudge="props.store.nudge(item.name, $event.rows, $event.cols)"
          @rename="props.store.renameItem(item.id, $event)"
          @resize="beginResize($event.event, item.name, $event.edges)"
          @resize-step="props.store.resizeEdge(item.name, $event.edge, $event.delta)"
        />
      </div>
    </div>

    <div v-if="showCells" class="mt-3">
      <p class="caption normal-case tracking-normal text-ink-muted">
        Drag across the dashed cells to give the selected region its shape — or drag on empty cells
        with nothing selected to create one. Drag a region to move it, its handles to resize it, and
        edit its name in place. Every region stays a rectangle, because
        <code class="font-mono">grid-template-areas</code> accepts nothing else.
      </p>

      <p class="caption mt-2 normal-case tracking-normal text-ink-muted">
        By keyboard: arrows move the selected region, <kbd class="font-mono">Shift</kbd> with an
        arrow resizes it from the bottom right, and tabbing on past it reaches the four edge handles
        — each one moves its own edge a grid line at a time, with
        <kbd class="font-mono">Home</kbd> and <kbd class="font-mono">End</kbd> for the extremes and
        <kbd class="font-mono">Esc</kbd> to step back to the region.
      </p>
    </div>
  </div>
</template>
