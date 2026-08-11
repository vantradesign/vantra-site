/** One option in a <ToolChipRail />. */
export interface Chip {
  /** Stable value emitted on select. */
  value: string
  label: string
  /** Optional swatch shown before the label. */
  swatch?: string
  /** Extra context for screen readers, e.g. a hex value. */
  description?: string
}

/** One option in a <ToolToggle />. */
export interface ToggleOption {
  value: string
  label: string
}
