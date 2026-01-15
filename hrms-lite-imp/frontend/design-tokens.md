# HRMS Lite Design Tokens

Complete reference for colors, typography, spacing, and components.

## Colors

### Primary (Indigo)
| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--color-primary-50` | `#eef2ff` | `#eef2ff` | Subtle backgrounds |
| `--color-primary-100` | `#e0e7ff` | `#e0e7ff` | Light backgrounds |
| `--color-primary-500` | `#6366f1` | `#6366f1` | Main brand color |
| `--color-primary-600` | `#4f46e5` | `#4f46e5` | Button backgrounds |

### Accent (Violet)
| Token | Value | Usage |
|-------|-------|-------|
| `--color-accent-400` | `#a78bfa` | Highlights |
| `--color-accent-500` | `#8b5cf6` | CTAs, gradients |
| `--color-accent-600` | `#7c3aed` | Button backgrounds |

### Semantic Colors
| Type | Light Text | Dark Text | Usage |
|------|------------|-----------|-------|
| Success | `success-600` | `success-400` | Positive states |
| Warning | `warning-700` | `warning-400` | Caution states |
| Error | `error-600` | `error-400` | Error states |

### Surface Colors (CSS Variables)
| Variable | Light | Dark |
|----------|-------|------|
| `--surface-primary` | `#ffffff` | `#020617` |
| `--surface-secondary` | `#f8fafc` | `#0f172a` |
| `--surface-tertiary` | `#f1f5f9` | `#1e293b` |
| `--surface-elevated` | `#ffffff` | `#1e293b` |

### Text Colors (CSS Variables)
| Variable | Light | Dark |
|----------|-------|------|
| `--text-primary` | `slate-900` | `slate-50` |
| `--text-secondary` | `slate-700` | `slate-200` |
| `--text-tertiary` | `slate-500` | `slate-400` |
| `--text-muted` | `slate-400` | `slate-500` |

---

## Typography

**Fonts:**
- **Headings**: `Outfit` (weights: 400-700)
- **Body**: `Inter` (weights: 300-700)

**Scale:**
| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 | 1.875rem (30px) | 700 | 1.2 |
| H2 | 1.5rem (24px) | 600 | 1.25 |
| H3 | 1.25rem (20px) | 600 | 1.3 |
| Body | 0.9375rem (15px) | 400 | 1.6 |
| Small | 0.875rem (14px) | 400 | 1.5 |
| Caption | 0.75rem (12px) | 500 | 1.4 |

---

## Spacing (8px Grid)

| Token | Value | Pixels |
|-------|-------|--------|
| `--space-1` | 0.25rem | 4px |
| `--space-2` | 0.5rem | 8px |
| `--space-3` | 0.75rem | 12px |
| `--space-4` | 1rem | 16px |
| `--space-6` | 1.5rem | 24px |
| `--space-8` | 2rem | 32px |
| `--space-12` | 3rem | 48px |

---

## Border Radius

| Token | Value |
|-------|-------|
| `--radius-sm` | 6px |
| `--radius-md` | 8px |
| `--radius-lg` | 12px |
| `--radius-xl` | 16px |
| `--radius-full` | 9999px |

---

## Shadows

**Light Mode:**
- `shadow-sm`: Subtle drop shadow
- `shadow-md`: Card shadow
- `shadow-lg`: Modal shadow

**Dark Mode:**
- `shadow-glow`: Primary glow effect
- `shadow-glow-lg`: Large glow effect

---

## Transitions

| Token | Duration |
|-------|----------|
| `--transition-fast` | 150ms |
| `--transition-normal` | 200ms |
| `--transition-slow` | 300ms |

---

## Component Classes

### Buttons
```css
.btn              /* Base button styles */
.btn-primary      /* Primary action */
.btn-secondary    /* Secondary action */
.btn-danger       /* Destructive action */
.btn-success      /* Positive action */
.btn-warning      /* Caution action */
.btn-ghost        /* Minimal style */
.btn-icon         /* Icon-only button */
.btn-sm           /* Small size */
.btn-lg           /* Large size */
```

### Inputs
```css
.input            /* Base input styles */
.input-error      /* Error state */
.input-success    /* Success state */
.select           /* Select dropdown */
.label            /* Form label */
```

### Cards
```css
.card             /* Base card */
.card-hover       /* Hoverable card */
.stat-card        /* Statistics card */
```

### Badges
```css
.badge            /* Base badge */
.badge-success    /* Success state */
.badge-danger     /* Error state */
.badge-warning    /* Warning state */
.badge-info       /* Info state */
```

### Tables
```css
.table-container  /* Scrollable wrapper */
.table            /* Base table */
.table-striped    /* Zebra striping */
```

---

## Usage Examples

### Theme Toggle
```jsx
import { ThemeToggle } from './components/common';
<ThemeToggle />
```

### CSS Variable Usage
```css
.my-element {
  color: var(--text-primary);
  background: var(--surface-secondary);
  border-color: var(--border-primary);
}
```

### Tailwind Classes
```jsx
<div className="bg-primary-500 text-white rounded-lg p-4">
  Primary button content
</div>
```
