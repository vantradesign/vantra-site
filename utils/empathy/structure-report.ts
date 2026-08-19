/**
 * Presentation utilities for the Screenreader Empathy tool page.
 *
 * Analysis (getStructureReport, heading tree, landmarks, scoring) comes from
 * @vantra-design/screenreader-empathy/core (v0.3.0+). This file provides the
 * UI-layer helpers: narrative text, announcement formatting, reading-order
 * grouping, fix suggestions, and Markdown export.
 */

import type {
  TraversalResult,
  TraversalEntry,
  StructureReport,
  HeadingNode,
} from '@vantra-design/screenreader-empathy/core'

// Re-export the types the page component needs.
export type { StructureReport, HeadingNode }
export { getStructureReport } from '@vantra-design/screenreader-empathy/core'

// ── Narrative builder ──

export function buildNarrative(result: TraversalResult, report: StructureReport): string[] {
  const lines: string[] = []

  if (report.score >= 70) {
    lines.push('This page has a solid information architecture. A screen reader user can navigate it effectively.')
  } else if (report.score >= 50) {
    lines.push('This page has a basic structure, but several issues make it harder for assistive technology users to navigate.')
  } else if (report.score >= 25) {
    lines.push('This page has significant structural problems that make it difficult for screen reader users to understand and navigate.')
  } else {
    lines.push('This page has very little accessible structure. A screen reader user would struggle to make sense of it.')
  }

  if (report.elementsBeforeMain > 10) {
    const skipNote = report.issues.some(i => i.code === 'no-skip-link')
      ? ' There is no skip link, so keyboard users must tab through all of them.'
      : ''
    lines.push(`A user encounters ${report.elementsBeforeMain} elements before reaching the main content.${skipNote}`)
  }

  if (report.landmarks.length === 0) {
    lines.push('The page has no landmark regions. Screen readers use landmarks (header, nav, main, footer) as a table of contents \u2014 without them, users must read linearly.')
  } else {
    const dupes = report.issues.find(i => i.code === 'duplicate-landmark-no-label')
    if (dupes) {
      lines.push(`There are ${dupes.count} landmark regions with the same role but no label. Screen reader users can\u2019t tell them apart.`)
    }
  }

  if (report.headingTree.length === 0) {
    lines.push('The page has no headings. Headings are the primary way screen reader users scan page content.')
  } else {
    if (report.issues.some(i => i.code === 'heading-level-skip')) {
      lines.push('The heading outline has level skips (e.g. jumping from h1 to h3). This breaks the logical document structure.')
    }
  }

  if (report.orphanedContentPercent > 15) {
    lines.push(`${report.orphanedContentPercent}% of page content sits outside any landmark region. Content outside landmarks is harder for screen reader users to find.`)
  }

  const critical = report.issues.filter(i => i.severity === 'critical')
  const serious = report.issues.filter(i => i.severity === 'serious')
  if (critical.length > 0 || serious.length > 0) {
    const parts: string[] = []
    if (critical.length > 0) parts.push(`${critical.length} critical`)
    if (serious.length > 0) parts.push(`${serious.length} serious`)
    lines.push(`There are ${parts.join(' and ')} issues that should be fixed before shipping.`)
  }

  return lines
}

// ── Fix suggestions ──

export const FIX_SUGGESTIONS: Record<string, string> = {
  'missing-accessible-name': 'Add an aria-label or aria-labelledby attribute to give this element a name.',
  'empty-link-text': 'Add visible text inside the <a> tag, or add an aria-label attribute.',
  'empty-button-text': 'Add visible text or an aria-label to the <button>.',
  'missing-form-label': 'Add a <label for="id"> element or an aria-label to the form control.',
  'heading-level-skip': 'Don\u2019t skip heading levels. Use h1 \u2192 h2 \u2192 h3 in order.',
  'missing-landmark': 'Wrap page sections in <header>, <nav>, <main>, <footer> elements.',
  'duplicate-id': 'Ensure every id attribute is unique on the page.',
  'redundant-role': 'Remove the role attribute \u2014 this element already has that role implicitly.',
  'missing-alt-text': 'Add alt="description" to the <img> tag. Use alt="" if decorative.',
  'generic-link-text': 'Replace "click here" / "read more" with descriptive link text.',
  'no-lang-attribute': 'Add lang="en" (or appropriate language) to the <html> element.',
  'tabindex-positive': 'Remove positive tabindex values. Use tabindex="0" or "-1" instead.',
  'no-h1': 'Add exactly one <h1> heading as the main page title.',
  'multiple-h1': 'Use only one <h1> per page. Demote others to <h2>.',
  'no-nav-landmark': 'Wrap your navigation links in a <nav> element.',
  'duplicate-landmark-no-label': 'Add aria-label to distinguish duplicate landmark roles.',
  'orphaned-content': 'Move this content inside a landmark region (<main>, <aside>, etc.).',
  'no-skip-link': 'Add a skip link at the top: <a href="#main">Skip to content</a>.',
  'landmark-nesting-violation': 'Don\u2019t nest landmarks inside each other (e.g. <main> inside <main>).',
  'content-before-main': 'Minimize content before <main>. Use a skip link so users can jump past it.',
  'flat-structure': 'Break content into sections with headings to create a navigable outline.',
  'wall-of-text': 'Break long text blocks into shorter paragraphs with subheadings.',
  'identical-links-different-href': 'Give each link unique text, or merge duplicates into one.',
  'adjacent-duplicate-links': 'Combine adjacent links that go to the same place into one link.',
  'table-no-headers': 'Add <th> elements to identify column/row headers in the table.',
  'table-no-caption': 'Add a <caption> element to describe the table\u2019s purpose.',
  'fieldset-no-legend': 'Add a <legend> inside <fieldset> to label the group.',
  'form-no-submit': 'Add a <button type="submit"> or <input type="submit"> to the form.',
  'no-title': 'Add a <title> element inside <head> with a descriptive page title.',
  'viewport-no-zoom': 'Remove maximum-scale or user-scalable=no from the viewport meta tag.',
}

// ── Announcement formatting ──

const ROLE_LABELS: Record<string, string> = {
  button: 'button', link: 'link', checkbox: 'checkbox', radio: 'radio button',
  tab: 'tab', switch: 'switch', textbox: 'edit text', listbox: 'pop-up button',
  slider: 'slider', searchbox: 'search text field', spinbutton: 'stepper',
  navigation: 'navigation', main: 'main', banner: 'banner',
  contentinfo: 'content info', complementary: 'complementary',
  form: 'form', search: 'search', region: 'region',
}

const ROLE_AFTER = new Set(['button', 'link', 'checkbox', 'radio', 'tab', 'switch'])
const FORM_CONTROLS = new Set(['textbox', 'listbox', 'slider', 'searchbox', 'spinbutton'])
const STRUCTURAL_ROLES = new Set([
  'navigation', 'main', 'banner', 'contentinfo', 'complementary',
  'form', 'search', 'region', 'list', 'table', 'group', 'separator',
  'row', 'cell', 'generic',
])

export function formatAnnouncement(entry: TraversalEntry): string {
  const { role, accessibleName, level, isLandmark } = entry
  const rl = ROLE_LABELS[role] ?? role

  if (role === 'image') {
    const missing = entry.flags.some(f => f.code === 'missing-alt-text')
    if (missing) return 'Image.'
    if (!accessibleName) return ''
    return `${accessibleName}, image.`
  }
  if (isLandmark) return accessibleName ? `${accessibleName}, ${rl} landmark.` : `${rl} landmark.`
  if (role === 'heading') {
    const h = level ? `Heading level ${level}` : 'Heading'
    return accessibleName ? `${h}, ${accessibleName}.` : `${h}.`
  }
  if (ROLE_AFTER.has(role)) return accessibleName ? `${accessibleName}, ${rl}.` : `${rl}.`
  if (FORM_CONTROLS.has(role)) return accessibleName ? `${accessibleName}, ${rl}.` : `${rl}.`
  if (role === 'separator') return 'Separator.'
  if (role === 'table') return accessibleName ? `${accessibleName}, table.` : 'Table.'
  if (role === 'list') return accessibleName ? `${accessibleName}, list.` : 'List.'
  if (role === 'listitem') return accessibleName || 'List item.'
  if (accessibleName) return accessibleName
  return ''
}

export function nameDisplay(entry: TraversalEntry): { text: string; style: 'normal' | 'structural' | 'missing' | 'empty' } {
  if (entry.accessibleName) return { text: entry.accessibleName, style: 'normal' }
  if (STRUCTURAL_ROLES.has(entry.role) || entry.isLandmark) {
    return { text: ROLE_LABELS[entry.role] ?? entry.role, style: 'structural' }
  }
  if (ROLE_AFTER.has(entry.role) || FORM_CONTROLS.has(entry.role)) {
    return { text: 'missing name', style: 'missing' }
  }
  return { text: '\u2014', style: 'empty' }
}

// ── Reading order grouping ──

export interface ReadingGroup {
  label: string
  role: string
  entries: TraversalEntry[]
}

export function groupEntriesByLandmark(
  result: TraversalResult,
  report: StructureReport,
): ReadingGroup[] {
  const groups: ReadingGroup[] = []
  let currentGroup: ReadingGroup = { label: 'Before landmarks', role: '', entries: [] }
  groups.push(currentGroup)

  const landmarkSelectors = report.landmarks.map(l => l.selector)
  const landmarkMap = new Map(report.landmarks.map(l => [l.selector, l]))

  for (const entry of result.entries) {
    const lm = landmarkMap.get(entry.selector)
    if (lm) {
      currentGroup = { label: lm.label || lm.role, role: lm.role, entries: [] }
      groups.push(currentGroup)
      currentGroup.entries.push(entry)
      continue
    }

    let matched = false
    for (let i = landmarkSelectors.length - 1; i >= 0; i--) {
      if (entry.selector.startsWith(landmarkSelectors[i]!)) {
        const lastMatchGroup = groups.filter(g => g.role === landmarkMap.get(landmarkSelectors[i]!)?.role)
        if (lastMatchGroup.length > 0) {
          lastMatchGroup[lastMatchGroup.length - 1]!.entries.push(entry)
          matched = true
          break
        }
      }
    }
    if (!matched) {
      currentGroup.entries.push(entry)
    }
  }

  return groups.filter(g => g.entries.length > 0)
}

// ── Markdown export ──

export function exportMarkdown(result: TraversalResult, report: StructureReport): string {
  const lines: string[] = []
  lines.push('# Accessibility Report', '')
  lines.push(`**Score:** ${report.score}/100 (${report.band})`)
  lines.push(`**Elements:** ${result.entries.length} | **Landmarks:** ${report.landmarks.length} | **Before main:** ${report.elementsBeforeMain} | **Orphaned:** ${report.orphanedContentPercent}%`)
  lines.push('')

  if (report.issues.length > 0) {
    lines.push('## Issues', '')
    for (const issue of report.issues) {
      const fix = FIX_SUGGESTIONS[issue.code]
      lines.push(`- **[${issue.severity}]** ${issue.message}${issue.count > 1 ? ` (\u00d7${issue.count})` : ''}`)
      if (fix) lines.push(`  - \u2192 ${fix}`)
    }
    lines.push('')
  }

  if (report.headingTree.length > 0) {
    lines.push('## Heading Outline', '')
    const flattenHeadings = (nodes: HeadingNode[], indent = 0): void => {
      for (const n of nodes) {
        lines.push(`${'  '.repeat(indent)}- h${n.level}: ${n.name || '(empty)'}`)
        flattenHeadings(n.children, indent + 1)
      }
    }
    flattenHeadings(report.headingTree)
    lines.push('')
  }

  if (report.landmarks.length > 0) {
    lines.push('## Landmarks', '')
    for (const l of report.landmarks) {
      lines.push(`- **${l.role}**${l.label ? `: ${l.label}` : ''}`)
    }
    lines.push('')
  }

  lines.push('---', '*Generated by Vantra Screenreader Empathy*')
  return lines.join('\n')
}
