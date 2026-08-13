<script setup lang="ts">
import {
  FLEX_ALIGN_ITEMS,
  FLEX_DIRECTION,
  FLEX_WRAP,
  JUSTIFY_CONTENT,
  PLACE_SELF,
} from '~/utils/tools/layout'
import type { GridFlexStore } from '~/composables/useGridFlexState'

const props = defineProps<{ store: GridFlexStore }>()

const store = props.store
const flex = computed(() => store.state.flex)
const selected = store.selectedItem
</script>

<template>
  <div>
    <ToolPanel label="Container" note="One dimension at a time: flex distributes along the main axis and only ever aligns on the cross axis.">
      <div class="grid gap-8 sm:grid-cols-2">
        <ToolSelect
          label="flex-direction"
          :model-value="flex.direction"
          :options="FLEX_DIRECTION"
          @update:model-value="store.setFlexValue('direction', $event as typeof flex.direction)"
        />
        <ToolSelect
          label="flex-wrap"
          :model-value="flex.wrap"
          :options="FLEX_WRAP"
          @update:model-value="store.setFlexValue('wrap', $event as typeof flex.wrap)"
        />
        <ToolSelect
          label="justify-content"
          :model-value="flex.justifyContent"
          :options="JUSTIFY_CONTENT"
          @update:model-value="store.setFlexValue('justifyContent', $event as typeof flex.justifyContent)"
        />
        <ToolSelect
          label="align-items"
          :model-value="flex.alignItems"
          :options="FLEX_ALIGN_ITEMS"
          @update:model-value="store.setFlexValue('alignItems', $event as typeof flex.alignItems)"
        />
        <ToolSelect
          label="align-content"
          :model-value="flex.alignContent"
          :options="JUSTIFY_CONTENT"
          :hint="flex.wrap === 'nowrap' ? 'No effect while flex-wrap is nowrap, so it is left out of the output.' : undefined"
          @update:model-value="store.setFlexValue('alignContent', $event as typeof flex.alignContent)"
        />
      </div>
    </ToolPanel>

    <div class="mt-12">
      <ToolPanel label="Gap">
        <div class="grid gap-8 sm:grid-cols-2">
          <ToolField
            label="Row gap"
            :model-value="flex.rowGap"
            placeholder="16px"
            @update:model-value="store.setGap('rowGap', $event)"
          />
          <ToolField
            label="Column gap"
            :model-value="flex.gapLinked ? flex.rowGap : flex.columnGap"
            placeholder="16px"
            :hint="flex.gapLinked ? 'Linked to the row gap.' : undefined"
            @update:model-value="store.setGap('columnGap', $event)"
          />
        </div>

        <button
          type="button"
          class="caption mt-6 inline-flex min-h-11 items-center gap-2 border px-4 normal-case tracking-normal transition-colors duration-200 ease-editorial"
          :class="flex.gapLinked ? 'border-ink bg-ink text-paper' : 'border-rule text-ink-muted hover:border-ink'"
          :aria-pressed="flex.gapLinked"
          @click="store.toggleGapLink()"
        >
          <span aria-hidden="true">{{ flex.gapLinked ? '⛓' : '⛓̸' }}</span>
          {{ flex.gapLinked ? 'Linked — one gap shorthand' : 'Unlinked — row-gap and column-gap' }}
        </button>
      </ToolPanel>
    </div>

    <div class="mt-12">
      <ToolPanel
        label="Selected item"
        :note="selected ? undefined : 'Nothing selected. Click an item on the canvas to set how it grows, shrinks and orders.'"
      >
        <div v-if="selected" class="grid gap-8">
          <ToolField
            label="Name"
            :model-value="selected.name"
            hint="Used as the generated class."
            @update:model-value="store.renameItem(selected.id, $event)"
          />

          <div class="grid gap-8 sm:grid-cols-2">
            <ToolSlider
              label="flex-grow"
              :model-value="selected.flexGrow"
              :min="0"
              :max="8"
              @update:model-value="store.updateItem(selected.id, 'flexGrow', $event)"
            />
            <ToolSlider
              label="flex-shrink"
              :model-value="selected.flexShrink"
              :min="0"
              :max="8"
              @update:model-value="store.updateItem(selected.id, 'flexShrink', $event)"
            />
          </div>

          <ToolField
            label="flex-basis"
            :model-value="selected.flexBasis"
            placeholder="auto"
            hint="A length, a percentage, or auto. This is the size flex-grow and flex-shrink work from."
            @update:model-value="store.updateItem(selected.id, 'flexBasis', $event)"
          />

          <div class="grid gap-8 sm:grid-cols-2">
            <ToolSlider
              label="order"
              :model-value="selected.order"
              :min="-4"
              :max="8"
              @update:model-value="store.updateItem(selected.id, 'order', $event)"
            />
            <ToolSelect
              label="align-self"
              :model-value="selected.alignSelf"
              :options="PLACE_SELF"
              @update:model-value="store.updateItem(selected.id, 'alignSelf', $event as typeof selected.alignSelf)"
            />
          </div>

          <p class="measure text-[0.9375rem] leading-snug text-ink-muted">
            <code class="font-mono">order</code> moves the box on screen but not in the document, so
            a keyboard still tabs through the original sequence. Reorder the markup instead when the
            visual order is the meaningful one.
          </p>
        </div>
      </ToolPanel>
    </div>
  </div>
</template>
