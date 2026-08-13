<script setup lang="ts">
import { JUSTIFY_CONTENT, PLACE_ITEMS, PLACE_SELF, formatTrackList } from '~/utils/tools/layout'
import type { GridFlexStore } from '~/composables/useGridFlexState'

const props = defineProps<{ store: GridFlexStore }>()

const store = props.store
const grid = computed(() => store.state.grid)

/** The stepper's write path: track *count*, with the values left alone. */
function setCount(axis: 'columns' | 'rows', next: number) {
  const current = store.state.grid[axis].length
  for (let i = current; i < next; i += 1) store.addTrack(axis)
  for (let i = current; i > next; i -= 1) store.removeTrack(axis, i - 1)
}

const selected = store.selectedItem

const span = computed(() => {
  const item = selected.value
  if (!item) return { rowSpan: 1, colSpan: 1 }
  return store.areaBounds(item.name) ?? { rowSpan: 1, colSpan: 1 }
})

function setSpan(rows: number, cols: number) {
  const item = selected.value
  if (!item) return
  store.setSpan(item.name, rows, cols)
}

const subgridColumns = computed(() =>
  selected.value ? formatTrackList(selected.value.subgrid.columns) : '',
)
const subgridRows = computed(() => (selected.value ? formatTrackList(selected.value.subgrid.rows) : ''))
</script>

<template>
  <div>
    <ToolPanel label="Columns and rows" note="The stepper adds tracks; the raw field takes any valid track list, including repeat() and minmax(). Both write to the same state.">
      <div class="grid gap-8 sm:grid-cols-2">
        <ToolSlider
          label="Column tracks"
          :model-value="grid.columns.length"
          :min="1"
          :max="12"
          @update:model-value="setCount('columns', $event)"
        />
        <ToolSlider
          label="Row tracks"
          :model-value="grid.rows.length"
          :min="1"
          :max="12"
          @update:model-value="setCount('rows', $event)"
        />
      </div>

      <div class="mt-10 grid gap-8 sm:grid-cols-2">
        <div>
          <p class="caption mb-3">Each column</p>
          <div class="grid gap-4">
            <div v-for="(track, index) in grid.columns" :key="`col-${index}`" class="flex items-end gap-3">
              <div class="flex-1">
                <ToolField
                  :label="`Column ${index + 1}`"
                  :model-value="track"
                  placeholder="1fr"
                  @update:model-value="store.setTrack('columns', index, $event)"
                />
              </div>
              <button
                type="button"
                class="caption min-h-11 border border-rule px-3 normal-case tracking-normal text-ink-muted transition-colors duration-200 ease-editorial hover:border-fail hover:text-fail disabled:opacity-40"
                :disabled="grid.columns.length <= 1"
                :aria-label="`Remove column ${index + 1}`"
                @click="store.removeTrack('columns', index)"
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        <div>
          <p class="caption mb-3">Each row</p>
          <div class="grid gap-4">
            <div v-for="(track, index) in grid.rows" :key="`row-${index}`" class="flex items-end gap-3">
              <div class="flex-1">
                <ToolField
                  :label="`Row ${index + 1}`"
                  :model-value="track"
                  placeholder="auto"
                  @update:model-value="store.setTrack('rows', index, $event)"
                />
              </div>
              <button
                type="button"
                class="caption min-h-11 border border-rule px-3 normal-case tracking-normal text-ink-muted transition-colors duration-200 ease-editorial hover:border-fail hover:text-fail disabled:opacity-40"
                :disabled="grid.rows.length <= 1"
                :aria-label="`Remove row ${index + 1}`"
                @click="store.removeTrack('rows', index)"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-10 grid gap-8 sm:grid-cols-2">
        <ToolField
          label="grid-template-columns (raw)"
          :model-value="store.columnsRaw.value"
          hint="e.g. repeat(auto-fill, minmax(240px, 1fr))"
          @update:model-value="store.setColumnsRaw($event)"
        />
        <ToolField
          label="grid-template-rows (raw)"
          :model-value="store.rowsRaw.value"
          hint="e.g. auto 1fr auto"
          @update:model-value="store.setRowsRaw($event)"
        />
      </div>
    </ToolPanel>

    <div class="mt-12">
      <ToolPanel label="Gap">
        <div class="grid gap-8 sm:grid-cols-2">
          <ToolField
            label="Row gap"
            :model-value="grid.rowGap"
            placeholder="16px"
            @update:model-value="store.setGap('rowGap', $event)"
          />
          <ToolField
            label="Column gap"
            :model-value="grid.gapLinked ? grid.rowGap : grid.columnGap"
            placeholder="16px"
            :hint="grid.gapLinked ? 'Linked to the row gap.' : undefined"
            @update:model-value="store.setGap('columnGap', $event)"
          />
        </div>

        <button
          type="button"
          class="caption mt-6 inline-flex min-h-11 items-center gap-2 border px-4 normal-case tracking-normal transition-colors duration-200 ease-editorial"
          :class="grid.gapLinked ? 'border-ink bg-ink text-paper' : 'border-rule text-ink-muted hover:border-ink'"
          :aria-pressed="grid.gapLinked"
          @click="store.toggleGapLink()"
        >
          <span aria-hidden="true">{{ grid.gapLinked ? '⛓' : '⛓̸' }}</span>
          {{ grid.gapLinked ? 'Linked — one gap shorthand' : 'Unlinked — row-gap and column-gap' }}
        </button>
      </ToolPanel>
    </div>

    <div class="mt-12">
      <ToolPanel label="Named areas" note="Named areas are worth it from three regions up: the container reads as a picture of the layout instead of a column of line numbers.">
        <button
          type="button"
          class="caption inline-flex min-h-11 items-center gap-2 border px-4 normal-case tracking-normal transition-colors duration-200 ease-editorial"
          :class="grid.useAreas ? 'border-ink bg-ink text-paper' : 'border-rule text-ink-muted hover:border-ink'"
          :aria-pressed="grid.useAreas"
          @click="store.toggleAreas()"
        >
          {{ grid.useAreas ? 'Using grid-template-areas' : 'Using line-based placement' }}
        </button>

        <ul v-if="store.warnings.value.length" class="mt-6 border-t border-rule pt-4">
          <li
            v-for="warning in store.warnings.value"
            :key="warning"
            class="text-[0.9375rem] leading-snug text-fail"
          >
            {{ warning }}
          </li>
        </ul>
      </ToolPanel>
    </div>

    <div class="mt-12">
      <ToolPanel label="Alignment">
        <div class="grid gap-8 sm:grid-cols-2">
          <ToolSelect
            label="justify-content"
            :model-value="grid.justifyContent"
            :options="JUSTIFY_CONTENT"
            @update:model-value="store.setGridValue('justifyContent', $event as typeof grid.justifyContent)"
          />
          <ToolSelect
            label="align-content"
            :model-value="grid.alignContent"
            :options="JUSTIFY_CONTENT"
            @update:model-value="store.setGridValue('alignContent', $event as typeof grid.alignContent)"
          />
          <ToolSelect
            label="justify-items"
            :model-value="grid.justifyItems"
            :options="PLACE_ITEMS"
            @update:model-value="store.setGridValue('justifyItems', $event as typeof grid.justifyItems)"
          />
          <ToolSelect
            label="align-items"
            :model-value="grid.alignItems"
            :options="PLACE_ITEMS"
            @update:model-value="store.setGridValue('alignItems', $event as typeof grid.alignItems)"
          />
        </div>
      </ToolPanel>
    </div>

    <div class="mt-12">
      <ToolPanel
        label="Selected item"
        :note="selected ? undefined : 'Nothing selected. Click an item on the canvas to place it, span it, or turn it into a subgrid.'"
      >
        <div v-if="selected" class="grid gap-8">
          <ToolField
            label="Name"
            :model-value="selected.name"
            hint="Used as the area name and as the generated class."
            @update:model-value="store.renameItem(selected.id, $event)"
          />

          <template v-if="grid.useAreas">
            <div class="grid gap-8 sm:grid-cols-2">
              <ToolSlider
                label="Column span"
                :model-value="span.colSpan"
                :min="1"
                :max="store.columnCount.value"
                @update:model-value="setSpan(span.rowSpan, $event)"
              />
              <ToolSlider
                label="Row span"
                :model-value="span.rowSpan"
                :min="1"
                :max="store.rowCount.value"
                @update:model-value="setSpan($event, span.colSpan)"
              />
            </div>
          </template>

          <div v-else class="grid gap-8 sm:grid-cols-2">
            <ToolField
              label="grid-column"
              :model-value="selected.column"
              placeholder="span 6"
              @update:model-value="store.updateItem(selected.id, 'column', $event)"
            />
            <ToolField
              label="grid-row"
              :model-value="selected.row"
              placeholder="1 / 3"
              @update:model-value="store.updateItem(selected.id, 'row', $event)"
            />
          </div>

          <div class="grid gap-8 sm:grid-cols-2">
            <ToolSelect
              label="justify-self"
              :model-value="selected.justifySelf"
              :options="PLACE_SELF"
              @update:model-value="store.updateItem(selected.id, 'justifySelf', $event as typeof selected.justifySelf)"
            />
            <ToolSelect
              label="align-self"
              :model-value="selected.alignSelf"
              :options="PLACE_SELF"
              @update:model-value="store.updateItem(selected.id, 'alignSelf', $event as typeof selected.alignSelf)"
            />
          </div>

          <div class="border-t border-rule pt-6">
            <button
              type="button"
              class="caption inline-flex min-h-11 items-center gap-2 border px-4 normal-case tracking-normal transition-colors duration-200 ease-editorial"
              :class="
                selected.subgrid.enabled
                  ? 'border-ink bg-ink text-paper'
                  : 'border-rule text-ink-muted hover:border-ink'
              "
              :aria-pressed="selected.subgrid.enabled"
              @click="store.toggleSubgrid(selected.id)"
            >
              {{ selected.subgrid.enabled ? 'Is a nested grid' : 'Make it a nested grid' }}
            </button>

            <details class="mt-4">
              <summary class="caption cursor-pointer normal-case tracking-normal text-blue">
                What subgrid does
              </summary>
              <p class="mt-3 measure text-[0.9375rem] leading-snug text-ink-muted">
                A normal nested grid starts its own track list, so a caption inside one card cannot
                line up with a caption inside its neighbour.
                <code class="font-mono">subgrid</code> makes the child adopt the parent's tracks
                instead, which is the only way to align content across siblings without hard-coding
                sizes. Supported in Firefox since 71, Safari 16 and Chrome 117 — old enough to use,
                new enough to check your floor.
                <AppLink
                  to="https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Subgrid"
                  accent="blue"
                >
                  MDN on subgrid
                </AppLink>
              </p>
            </details>

            <div v-if="selected.subgrid.enabled" class="mt-6 grid gap-8">
              <div class="grid gap-8 sm:grid-cols-2">
                <button
                  type="button"
                  class="caption min-h-11 border px-4 normal-case tracking-normal transition-colors duration-200 ease-editorial"
                  :class="
                    selected.subgrid.columnsSubgrid
                      ? 'border-ink bg-ink text-paper'
                      : 'border-rule text-ink-muted hover:border-ink'
                  "
                  :aria-pressed="selected.subgrid.columnsSubgrid"
                  @click="
                    store.updateItem(selected.id, 'subgrid', {
                      ...selected.subgrid,
                      columnsSubgrid: !selected.subgrid.columnsSubgrid,
                    })
                  "
                >
                  Columns: {{ selected.subgrid.columnsSubgrid ? 'subgrid' : 'own tracks' }}
                </button>

                <button
                  type="button"
                  class="caption min-h-11 border px-4 normal-case tracking-normal transition-colors duration-200 ease-editorial"
                  :class="
                    selected.subgrid.rowsSubgrid
                      ? 'border-ink bg-ink text-paper'
                      : 'border-rule text-ink-muted hover:border-ink'
                  "
                  :aria-pressed="selected.subgrid.rowsSubgrid"
                  @click="
                    store.updateItem(selected.id, 'subgrid', {
                      ...selected.subgrid,
                      rowsSubgrid: !selected.subgrid.rowsSubgrid,
                    })
                  "
                >
                  Rows: {{ selected.subgrid.rowsSubgrid ? 'subgrid' : 'own tracks' }}
                </button>
              </div>

              <ToolField
                v-if="!selected.subgrid.columnsSubgrid"
                label="Nested grid-template-columns"
                :model-value="subgridColumns"
                placeholder="1fr 1fr"
                @update:model-value="
                  store.updateItem(selected.id, 'subgrid', {
                    ...selected.subgrid,
                    columns: $event.trim().split(/\s+/).filter(Boolean),
                  })
                "
              />

              <ToolField
                v-if="!selected.subgrid.rowsSubgrid"
                label="Nested grid-template-rows"
                :model-value="subgridRows"
                placeholder="auto"
                @update:model-value="
                  store.updateItem(selected.id, 'subgrid', {
                    ...selected.subgrid,
                    rows: $event.trim().split(/\s+/).filter(Boolean),
                  })
                "
              />

              <ToolSlider
                label="Placeholder children"
                :model-value="selected.subgrid.childCount"
                :min="0"
                :max="8"
                @update:model-value="
                  store.updateItem(selected.id, 'subgrid', {
                    ...selected.subgrid,
                    childCount: $event,
                  })
                "
              />
            </div>
          </div>
        </div>
      </ToolPanel>
    </div>
  </div>
</template>
