/**
 * Generates demo design token files client-side for download. The demo files
 * exercise every parser feature: valid colours, an intentional fail pair,
 * var() references, non-colour properties, and mixed naming conventions.
 */

const DEMO_JSON = {
  color: {
    'background': { $value: '#ffffff', $type: 'color' },
    'surface': { $value: '#f5f5f5', $type: 'color' },
    'text-primary': { $value: '#1a1a1a', $type: 'color' },
    'text-secondary': { $value: '#6b7280', $type: 'color' },
    'text-light': {
      $value: '#d1d5db',
      $type: 'color',
      $description: 'Intentionally low contrast on white — this should fail AA.',
    },
    'brand-primary': { $value: '#2563eb', $type: 'color' },
    'brand-accent': { $value: '#f59e0b', $type: 'color' },
    'danger': { $value: '#dc2626', $type: 'color' },
  },
  spacing: {
    sm: { $value: '0.5rem', $type: 'dimension' },
    md: { $value: '1rem', $type: 'dimension' },
  },
}

const DEMO_CSS = `/**
 * Demo design tokens — exercises var() resolution, colour detection, and
 * intentional contrast failures for testing.
 */
:root {
  /* Backgrounds */
  --color-background: #ffffff;
  --color-surface: #f5f5f5;

  /* Text */
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #6b7280;
  --color-text-light: #d1d5db; /* Intentionally fails AA on white */

  /* Brand */
  --color-brand-primary: #2563eb;
  --color-brand-accent: #f59e0b;

  /* Alias — var() reference */
  --color-danger: var(--color-brand-primary);

  /* Non-colour properties (should be ignored) */
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --radius-md: 0.375rem;
}
`

function downloadBlob(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()

  // Clean up after a tick so the browser has time to start the download
  setTimeout(() => {
    URL.revokeObjectURL(url)
    a.remove()
  }, 100)
}

export function downloadDemoJson(): void {
  downloadBlob(JSON.stringify(DEMO_JSON, null, 2), 'demo-tokens.json', 'application/json')
}

export function downloadDemoCss(): void {
  downloadBlob(DEMO_CSS, 'demo-tokens.css', 'text/css')
}
