<script setup lang="ts">
import type { LayoutItemState, LayoutMode, ResizeEdge } from '~/utils/tools/layout'
import { formatTrackList } from '~/utils/tools/layout'
import type { EdgeRange } from '~/utils/tools/layout-drag'

const props = defineProps<{
  item: LayoutItemState
  mode: LayoutMode
  /** Grid mode only: the container places children by name rather than by line. */
  useAreas: boolean
  selected: boolean
  /** Read-only preview (an AI suggestion) drops all interaction. */
  inert?: boolean
  /** Areas mode only: drag moves the region, arrows nudge it. */
  draggable?: boolean
  /** Line number and legal range per edge, for the splitter handles' ARIA. */
  edges?: Partial<Record<ResizeEdge, EdgeRange | null>>
}>()

const emit = defineEmits<{
  select: []
  grab: [PointerEvent]
  nudge: [{ rows: number; cols: number }]
  rename: [string]
  resize: [{ event: PointerEvent; edges: ResizeEdge[] }]
  resizeStep: [{ edge: ResizeEdge; delta: number }]
}>()

/**
 * The four edges, as ARIA window splitters.
 *
 * `role="separator"` with a value is the pattern for "drag the boundary between
 * two regions", and an edge of a grid area is exactly that. Each gets its own tab
 * stop, which the splitter pattern expects and which only exists while the region
 * is selected — so the tab order grows by four, once, not by four per region.
 *
 * Roving tabindex was the wrong instinct here: it spends the arrow keys on moving
 * focus between handles, and the arrow keys are what moves the edge. A splitter
 * owns its arrows, so navigation stays on Tab where it belongs.
 *
 * A horizontal separator (the top or bottom edge) is moved by Up and Down; a
 * vertical one by Left and Right.
 */
const EDGE_HANDLES: Array<{
  edge: ResizeEdge
  label: string
  orientation: 'horizontal' | 'vertical'
  class: string
  cursor: string
}> = [
  {
    edge: 'n',
    label: 'Top',
    orientation: 'horizontal',
    class: '-top-1.5 left-1/2 -translate-x-1/2',
    cursor: 'cursor-ns-resize',
  },
  {
    edge: 'e',
    label: 'Right',
    orientation: 'vertical',
    class: 'top-1/2 -right-1.5 -translate-y-1/2',
    cursor: 'cursor-ew-resize',
  },
  {
    edge: 's',
    label: 'Bottom',
    orientation: 'horizontal',
    class: '-bottom-1.5 left-1/2 -translate-x-1/2',
    cursor: 'cursor-ns-resize',
  },
  {
    edge: 'w',
    label: 'Left',
    orientation: 'vertical',
    class: 'top-1/2 -left-1.5 -translate-y-1/2',
    cursor: 'cursor-ew-resize',
  },
]

/**
 * Corners stay mouse-only and aria-hidden. Each is a shortcut for two edges at
 * once, so nothing is unreachable without them — and a focusable control whose
 * whole purpose is a diagonal drag has no honest keyboard behaviour to offer.
 */
const CORNER_HANDLES: Array<{ edges: ResizeEdge[]; class: string; cursor: string }> = [
  { edges: ['n', 'w'], class: '-top-1.5 -left-1.5', cursor: 'cursor-nwse-resize' },
  { edges: ['n', 'e'], class: '-top-1.5 -right-1.5', cursor: 'cursor-nesw-resize' },
  { edges: ['s', 'e'], class: '-bottom-1.5 -right-1.5', cursor: 'cursor-nwse-resize' },
  { edges: ['s', 'w'], class: '-bottom-1.5 -left-1.5', cursor: 'cursor-nesw-resize' },
]

const surface = ref<HTMLButtonElement | null>(null)

function rangeFor(edge: ResizeEdge): EdgeRange | null {
  return props.edges?.[edge] ?? null
}

/** Keys that move a splitter, by the separator's own orientation. */
const SPLITTER_KEYS: Record<'horizontal' | 'vertical', Record<string, number>> = {
  horizontal: { ArrowUp: -1, ArrowDown: 1 },
  vertical: { ArrowLeft: -1, ArrowRight: 1 },
}

function onHandleKeydown(
  event: KeyboardEvent,
  edge: ResizeEdge,
  orientation: 'horizontal' | 'vertical',
) {
  /* Escape hands focus back to the region, so a keyboard user is never stranded
     on a handle that is about to unmount. */
  if (event.key === 'Escape') {
    event.preventDefault()
    surface.value?.focus()
    return
  }

  const range = rangeFor(edge)

  if (event.key === 'Home' || event.key === 'End') {
    if (!range) return
    event.preventDefault()
    const target = event.key === 'Home' ? range.min : range.max
    emit('resizeStep', { edge, delta: target - range.value })
    return
  }

  const delta = SPLITTER_KEYS[orientation][event.key]
  if (delta === undefined) return

  event.preventDefault()
  emit('resizeStep', { edge, delta })
}

/**
 * Selection happens on pointerdown rather than on click, and that is load-bearing.
 *
 * Starting a drag drops the region's pointer events so that hit-testing can reach
 * the cells underneath it. That happens on pointerdown, which means the pointer is
 * released over a different element and the browser dispatches `click` to a common
 * ancestor instead of to this button — so a plain click on a region selected
 * nothing, and no handles ever appeared. Clicking is not a reliable signal for an
 * element that removes itself from hit-testing mid-gesture.
 *
 * `@click` stays for keyboards: Enter and Space fire a click with no pointerdown.
 */
function onSurfacePointerDown(event: PointerEvent) {
  emit('select')
  if (props.draggable) emit('grab', event)
}

/** Renaming on every keystroke would fight the uniqueness suffix mid-word. */
function onRename(event: Event) {
  const next = (event.target as HTMLInputElement).value
  if (next.trim()) emit('rename', next)
}

/**
 * Placement is inline style rather than a class because the values are arbitrary
 * user input; a class would mean generating Tailwind at runtime, which is not a
 * thing. Kept to the placement properties only — everything visual is a class.
 */
const style = computed(() => {
  if (props.mode === 'flex') {
    return {
      flexGrow: String(props.item.flexGrow),
      flexShrink: String(props.item.flexShrink),
      flexBasis: props.item.flexBasis || 'auto',
      order: String(props.item.order),
      alignSelf: props.item.alignSelf === 'auto' ? undefined : props.item.alignSelf,
    }
  }

  const placement = props.useAreas
    ? { gridArea: props.item.name }
    : {
        gridColumn: props.item.column || undefined,
        gridRow: props.item.row || undefined,
      }

  const subgrid = props.item.subgrid

  return {
    ...placement,
    justifySelf: props.item.justifySelf === 'auto' ? undefined : props.item.justifySelf,
    alignSelf: props.item.alignSelf === 'auto' ? undefined : props.item.alignSelf,
    ...(subgrid.enabled
      ? {
          display: 'grid',
          gridTemplateColumns: subgrid.columnsSubgrid
            ? 'subgrid'
            : formatTrackList(subgrid.columns) || undefined,
          gridTemplateRows: subgrid.rowsSubgrid ? 'subgrid' : formatTrackList(subgrid.rows) || undefined,
        }
      : {}),
  }
})

/**
 * Shift with an arrow resizes from the bottom-right, the convention slide editors
 * settled on. It is a shortcut, not the accessible path — that is the handles —
 * but it means the common case of "one column wider" needs no tab stop at all.
 */
const SHIFT_RESIZE: Record<string, { edge: ResizeEdge; delta: number }> = {
  ArrowRight: { edge: 'e', delta: 1 },
  ArrowLeft: { edge: 'e', delta: -1 },
  ArrowDown: { edge: 's', delta: 1 },
  ArrowUp: { edge: 's', delta: -1 },
}

function onKeydown(event: KeyboardEvent) {
  if (!props.draggable || props.inert) return

  if (event.shiftKey) {
    const step = SHIFT_RESIZE[event.key]
    if (!step) return
    event.preventDefault()
    emit('resizeStep', step)
    return
  }

  const deltas: Record<string, { rows: number; cols: number }> = {
    ArrowUp: { rows: -1, cols: 0 },
    ArrowDown: { rows: 1, cols: 0 },
    ArrowLeft: { rows: 0, cols: -1 },
    ArrowRight: { rows: 0, cols: 1 },
  }

  const delta = deltas[event.key]
  if (!delta) return

  /* The canvas is not a scroll container, so claiming the arrow keys here costs
     the user nothing and is the only way to move a region without a mouse. */
  event.preventDefault()
  emit('nudge', delta)
}
</script>

<template>
  <!-- A div rather than a button, because a region now holds its own name input
       and eight handles, and interactive controls cannot live inside a button.
       Selection and dragging move to a surface stretched across the region. -->
  <div
    :style="style"
    class="relative z-10 min-h-16 border p-3 transition-colors duration-200 ease-editorial"
    :class="[
      props.selected ? 'border-blue bg-cyan-soft' : 'border-ink bg-paper',
      props.item.subgrid.enabled ? 'gap-2' : '',
    ]"
  >
    <button
      v-if="!props.inert"
      ref="surface"
      type="button"
      class="absolute inset-0 z-0 outline-none focus-visible:ring-2 focus-visible:ring-blue"
      :class="props.draggable ? 'cursor-grab touch-none' : ''"
      :aria-pressed="props.selected"
      :aria-label="
        `${props.item.name}${props.draggable ? ', drag or use the arrow keys to move it' : ''}`
      "
      @click="emit('select')"
      @pointerdown="onSurfacePointerDown"
      @keydown="onKeydown"
    />

    <!-- The name is the area name is the generated class, so editing it here is
         editing the layout, not a label. -->
    <input
      v-if="props.selected && !props.inert"
      :value="props.item.name"
      :aria-label="`Name of the ${props.item.name} area`"
      spellcheck="false"
      class="caption relative z-20 w-full max-w-[14ch] border-b border-blue bg-transparent normal-case tracking-normal text-ink outline-none"
      :class="props.item.subgrid.enabled ? 'col-span-full' : ''"
      @change="onRename"
      @keydown.stop
      @pointerdown.stop
    />

    <span
      v-else
      class="caption pointer-events-none relative z-10 normal-case tracking-normal"
      :class="props.item.subgrid.enabled ? 'col-span-full' : ''"
    >
      {{ props.item.name }}
      <span v-if="props.item.subgrid.enabled" class="text-blue">· subgrid</span>
    </span>

    <!-- Edge handles: real splitters, focusable and arrow-key operable. -->
    <div
      v-for="handle in props.selected && props.draggable && !props.inert ? EDGE_HANDLES : []"
      :key="handle.edge"
      role="separator"
      tabindex="0"
      :aria-orientation="handle.orientation"
      :aria-label="`${handle.label} edge of ${props.item.name}`"
      :aria-valuenow="rangeFor(handle.edge)?.value"
      :aria-valuemin="rangeFor(handle.edge)?.min"
      :aria-valuemax="rangeFor(handle.edge)?.max"
      :aria-valuetext="
        rangeFor(handle.edge)
          ? `${handle.label} edge on grid line ${rangeFor(handle.edge)!.value}`
          : undefined
      "
      class="absolute z-30 h-3 w-3 border border-paper bg-blue outline-none focus-visible:ring-2 focus-visible:ring-ink"
      :class="[handle.class, handle.cursor]"
      @pointerdown.stop="emit('resize', { event: $event, edges: [handle.edge] })"
      @keydown="onHandleKeydown($event, handle.edge, handle.orientation)"
    />

    <div
      v-for="handle in props.selected && props.draggable && !props.inert ? CORNER_HANDLES : []"
      :key="handle.edges.join('')"
      aria-hidden="true"
      class="absolute z-30 h-3 w-3 border border-paper bg-blue"
      :class="[handle.class, handle.cursor]"
      @pointerdown.stop="emit('resize', { event: $event, edges: handle.edges })"
    />

    <!-- Placeholder children exist so the nested tracks are visible at all: a
         subgrid with nothing in it looks identical to a plain block. -->
    <span
      v-for="child in props.item.subgrid.enabled ? props.item.subgrid.childCount : 0"
      :key="child"
      class="pointer-events-none relative z-10 min-h-10 border border-dashed border-blue/50"
      aria-hidden="true"
    />
  </div>
</template>
