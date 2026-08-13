import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LayoutItem from './LayoutItem.vue'
import { createItem } from '~/utils/tools/layout-presets'

/**
 * The one component test in the suite, and it exists for a specific failure.
 *
 * Selection used to hang off `@click`. Starting a drag drops the region's pointer
 * events so hit-testing can reach the cells underneath, which happens on
 * pointerdown — so the pointer came up over a different element, the browser sent
 * `click` to a common ancestor, and clicking a region selected nothing. No
 * selection meant no handles, which is exactly what it looked like from outside.
 *
 * jsdom cannot reproduce that (no layout engine, so no hit-testing), but it can
 * pin the fix: pointerdown is what selects.
 */
function mountItem(
  props: Partial<InstanceType<typeof LayoutItem>['$props']> = {},
  /* Focus assertions need the component in the real document: an element that is
     not attached can be focused without becoming document.activeElement. */
  options: { attach?: boolean } = {},
) {
  return mount(LayoutItem, {
    attachTo: options.attach ? document.body : undefined,
    props: {
      item: createItem('main'),
      mode: 'grid',
      useAreas: true,
      selected: false,
      draggable: true,
      ...props,
    },
  })
}

/** The full-bleed selection surface, which is the first button in the region. */
function surfaceOf(wrapper: ReturnType<typeof mountItem>) {
  return wrapper.get('button')
}

describe('LayoutItem — selection', () => {
  it('selects on pointerdown, not only on click', async () => {
    const wrapper = mountItem()

    await surfaceOf(wrapper).trigger('pointerdown')

    expect(wrapper.emitted('select')).toHaveLength(1)
  })

  it('starts a drag on the same pointerdown', async () => {
    const wrapper = mountItem()

    await surfaceOf(wrapper).trigger('pointerdown')

    expect(wrapper.emitted('grab')).toHaveLength(1)
  })

  it('still selects on click, which is how a keyboard activates the surface', async () => {
    const wrapper = mountItem()

    await surfaceOf(wrapper).trigger('click')

    expect(wrapper.emitted('select')).toHaveLength(1)
  })

  it('selects without grabbing when the region is not draggable', async () => {
    const wrapper = mountItem({ draggable: false })

    await surfaceOf(wrapper).trigger('pointerdown')

    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.emitted('grab')).toBeUndefined()
  })

  it('reports its selected state to assistive technology', async () => {
    const wrapper = mountItem({ selected: true })

    expect(surfaceOf(wrapper).attributes('aria-pressed')).toBe('true')
  })
})

describe('LayoutItem — handles', () => {
  it('shows no handles until the region is selected', () => {
    const wrapper = mountItem()

    expect(wrapper.findAll('[role="separator"]')).toHaveLength(0)
  })

  it('shows one focusable splitter per edge once selected', () => {
    const wrapper = mountItem({ selected: true })
    const handles = wrapper.findAll('[role="separator"]')

    expect(handles).toHaveLength(4)
    for (const handle of handles) {
      expect(handle.attributes('tabindex')).toBe('0')
    }
  })

  it('announces each edge with the line it sits on', () => {
    const wrapper = mountItem({
      selected: true,
      edges: {
        n: { value: 2, min: 1, max: 3 },
        e: { value: 4, min: 3, max: 5 },
        s: { value: 4, min: 3, max: 5 },
        w: { value: 2, min: 1, max: 3 },
      },
    })

    const top = wrapper.get('[aria-label="Top edge of main"]')

    expect(top.attributes('role')).toBe('separator')
    expect(top.attributes('aria-orientation')).toBe('horizontal')
    expect(top.attributes('aria-valuenow')).toBe('2')
    expect(top.attributes('aria-valuemin')).toBe('1')
    expect(top.attributes('aria-valuemax')).toBe('3')
  })

  it('orients the side edges vertically, since the separator itself is vertical', () => {
    const wrapper = mountItem({ selected: true })

    expect(wrapper.get('[aria-label="Right edge of main"]').attributes('aria-orientation')).toBe(
      'vertical',
    )
  })

  it('keeps the corner handles out of the accessibility tree', () => {
    const wrapper = mountItem({ selected: true })

    /* Four corners, mouse-only: every corner move is reachable as two edges, so
       nothing is lost, and a focusable diagonal-drag control would be a lie. */
    const corners = wrapper.findAll('[aria-hidden="true"].cursor-nwse-resize, [aria-hidden="true"].cursor-nesw-resize')

    expect(corners).toHaveLength(4)
    for (const corner of corners) {
      expect(corner.attributes('tabindex')).toBeUndefined()
      expect(corner.attributes('role')).toBeUndefined()
    }
  })
})

describe('LayoutItem — keyboard', () => {
  it('moves the region with a bare arrow key', async () => {
    const wrapper = mountItem({ selected: true })

    await surfaceOf(wrapper).trigger('keydown', { key: 'ArrowRight' })

    expect(wrapper.emitted('nudge')).toEqual([[{ rows: 0, cols: 1 }]])
  })

  it('resizes from the bottom right with Shift and an arrow', async () => {
    const wrapper = mountItem({ selected: true })

    await surfaceOf(wrapper).trigger('keydown', { key: 'ArrowRight', shiftKey: true })

    expect(wrapper.emitted('resizeStep')).toEqual([[{ edge: 'e', delta: 1 }]])
    expect(wrapper.emitted('nudge')).toBeUndefined()
  })

  it('shrinks with Shift and the opposite arrow', async () => {
    const wrapper = mountItem({ selected: true })

    await surfaceOf(wrapper).trigger('keydown', { key: 'ArrowUp', shiftKey: true })

    expect(wrapper.emitted('resizeStep')).toEqual([[{ edge: 's', delta: -1 }]])
  })

  it('moves a horizontal splitter with Up and Down', async () => {
    const wrapper = mountItem({ selected: true })
    const top = wrapper.get('[aria-label="Top edge of main"]')

    await top.trigger('keydown', { key: 'ArrowDown' })

    expect(wrapper.emitted('resizeStep')).toEqual([[{ edge: 'n', delta: 1 }]])
  })

  it('ignores the cross-axis arrows on a horizontal splitter', async () => {
    const wrapper = mountItem({ selected: true })
    const top = wrapper.get('[aria-label="Top edge of main"]')

    await top.trigger('keydown', { key: 'ArrowLeft' })

    expect(wrapper.emitted('resizeStep')).toBeUndefined()
  })

  it('moves a vertical splitter with Left and Right', async () => {
    const wrapper = mountItem({ selected: true })
    const right = wrapper.get('[aria-label="Right edge of main"]')

    await right.trigger('keydown', { key: 'ArrowLeft' })

    expect(wrapper.emitted('resizeStep')).toEqual([[{ edge: 'e', delta: -1 }]])
  })

  it('jumps an edge to its limit with Home and End', async () => {
    const wrapper = mountItem({
      selected: true,
      edges: { s: { value: 3, min: 2, max: 6 } },
    })
    const bottom = wrapper.get('[aria-label="Bottom edge of main"]')

    await bottom.trigger('keydown', { key: 'End' })
    await bottom.trigger('keydown', { key: 'Home' })

    /* Deltas, not absolute values: the store owns the position, so the handle
       only ever asks for a relative step. */
    expect(wrapper.emitted('resizeStep')).toEqual([
      [{ edge: 's', delta: 3 }],
      [{ edge: 's', delta: -1 }],
    ])
  })

  it('does nothing for Home when the edge has no known range', async () => {
    const wrapper = mountItem({ selected: true })
    const bottom = wrapper.get('[aria-label="Bottom edge of main"]')

    await bottom.trigger('keydown', { key: 'Home' })

    expect(wrapper.emitted('resizeStep')).toBeUndefined()
  })

  it('hands focus back to the region on Escape, so nobody is stranded', async () => {
    const wrapper = mountItem({ selected: true }, { attach: true })
    const top = wrapper.get('[aria-label="Top edge of main"]')

    await top.trigger('keydown', { key: 'Escape' })

    expect(document.activeElement).toBe(surfaceOf(wrapper).element)

    wrapper.unmount()
  })
})

describe('LayoutItem — renaming', () => {
  it('renames on change rather than on every keystroke', async () => {
    const wrapper = mountItem({ selected: true })
    const input = wrapper.get('input')

    /* The value is set directly and `change` fired once, because setValue() emits
       an input *and* a change event — which made an earlier version of this test
       see two renames and look like a bug in the component. */
    input.element.value = 'sidebar'
    await input.trigger('change')

    expect(wrapper.emitted('rename')).toEqual([['sidebar']])
  })

  it('does not rename while typing, only once the field is committed', async () => {
    const wrapper = mountItem({ selected: true })
    const input = wrapper.get('input')

    input.element.value = 'sideba'
    await input.trigger('input')

    expect(wrapper.emitted('rename')).toBeUndefined()
  })

  it('refuses to rename a region to nothing', async () => {
    const wrapper = mountItem({ selected: true })
    const input = wrapper.get('input')

    input.element.value = '   '
    await input.trigger('change')

    expect(wrapper.emitted('rename')).toBeUndefined()
  })

  it('offers no name input while the region is unselected', () => {
    expect(mountItem().find('input').exists()).toBe(false)
  })
})

describe('LayoutItem — preview', () => {
  it('takes no input at all when inert', async () => {
    const wrapper = mountItem({ inert: true, selected: true })

    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.findAll('[role="separator"]')).toHaveLength(0)
    expect(wrapper.find('input').exists()).toBe(false)
  })
})
