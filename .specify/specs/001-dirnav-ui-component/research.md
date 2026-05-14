# Research: [TBD] UI Component

**Feature**: 001-dirnav-ui-component | **Date**: 2026-05-13

---

## Fuzzy Search Library

**Decision**: uFuzzy

**Rationale**: 1.2kb min+gzip vs ~24kb for fuse.js. For a userscript-target bundle, size is a first-class concern. uFuzzy's strict character-order matching with `info` + `order` APIs provides relevance scoring sufficient for the 500-node advisory ceiling. The API is minimal: `search(haystack, needle)` returns indices + match metadata usable for highlight rendering.

**Alternatives considered**:
- fuse.js: Richer API, flexible matching modes, but 20× larger. Overkill for short node-name strings.
- minisearch: ~5kb, full-text search designed for documents — not optimized for short name strings.
- Custom implementation: Viable for ≤500 nodes, but maintaining a scoring algorithm adds long-term burden.

---

## SolidJS + Shadow DOM Mounting

**Decision**: Manual shadow root with SolidJS `render()`

**Rationale**: Create a host `div`, append it to `document.body`, call `.attachShadow({ mode: 'open' })`, then mount a child element into the shadow root. SolidJS `render()` targets that child element. This gives full style isolation with zero custom-element registration overhead.

```ts
const host = document.createElement('div');
document.body.appendChild(host);
const shadow = host.attachShadow({ mode: 'open' });
const mount = document.createElement('div');
shadow.appendChild(mount);
render(() => <Root />, mount);
```

**Alternatives considered**:
- `solid-element`: Web component registration, more ceremony, ties the API to custom element naming — not needed since consumers call `init()` directly.
- No shadow DOM: Rejected — spec non-negotiable for style isolation in userscript environments.

---

## Focus Trap

**Decision**: Custom minimal focus trap (~25 lines)

**Rationale**: Focus trapping is needed only inside modal sheet overlays. The pattern is well-understood: intercept Tab/Shift+Tab, query focusable elements within the modal container, and cycle through them. A full library like `@solid-primitives/focus` adds 3kb+ for one pattern.

**Progressive enhancement**: Apply the `inert` attribute to elements outside the modal as a browser-native complement where supported (Chrome 102+, Firefox 112+).

**Alternatives considered**:
- `@solid-primitives/focus`: Good API but unnecessary overhead for this single pattern.
- `focus-trap`: 2kb, popular, but another dependency for trivial functionality.

---

## Keyboard Shortcut Registry

**Decision**: Custom two-tier shortcut registry

**Rationale**: A single `keydown` listener on `document` handles the global shortcut (show/hide/focus). Focus-scoped shortcuts attach a `keydown` listener to the shadow host's `tabindex="-1"` container, firing only when it or a descendant has focus. A `Map<string, () => void>` registry allows runtime shortcut updates from meta settings without rebinding DOM listeners.

**Shortcut string format**: `"Ctrl+\`"`, `"Alt+Shift+D"` — modifier(s) joined with `+`, key last. Normalized on parse.

**Alternatives considered**:
- `@solid-primitives/keyboard`: Good API but requires custom global/focus split logic anyway.
- hotkeys-js: Too large; adds 3kb for functionality covered in ~40 lines.

---

## Build Configuration

**Decision**: Two Vite build targets

**Rationale**:
1. **Library build** (ESM + CJS): SolidJS as external peer dep. Output ~10-15kb. For host-app integration.
2. **Userscript build** (IIFE): SolidJS bundled in, self-contained. Target ~70-90kb raw. Emits a single `.user.js` with `@grant` metadata headers.

Both targets share the same source. A `vite.userscript.config.ts` companion config handles the second target with `build.lib.formats: ['iife']` and no `external` entries.

**Alternatives considered**:
- Single ESM-only build: Userscript environments lack a module system; IIFE required.
- Rollup standalone: No benefit — Vite already uses Rollup internally and matches the existing toolchain.

---

## localStorage Key Schema

**Decision**: `{prefix}.{category}.{setting}`

**Rationale**: Category grouping prevents collisions between setting types and allows targeted invalidation. All keys scoped under consumer-provided `keyPrefix`.

| Key Pattern | Category | Purpose |
|-------------|----------|---------|
| `{p}.meta.theme` | meta | Theme preference |
| `{p}.meta.mode` | meta | Default mode |
| `{p}.meta.palettePin` | meta | Palette pin position |
| `{p}.meta.rememberMode` | meta | Remember-last-mode flag |
| `{p}.meta.lastMode` | meta | Last active mode (when rememberMode=true) |
| `{p}.meta.globalShortcut` | meta | Global shortcut override |
| `{p}.meta.swapShortcut` | meta | Mode-swap shortcut override |
| `{p}.window.x` | window | Dir view x position |
| `{p}.window.y` | window | Dir view y position |
| `{p}.window.width` | window | Dir view width |
| `{p}.window.height` | window | Dir view height |
| `{p}.input.{node-path}` | input | Input node saved value (path = `/`-joined key path) |

---

## ARIA Implementation

**Decision**: Semantic roles + live region + focus management

**Palette**:
- Container: `role="combobox"` wrapping input + results
- Input: native `<input type="text">` with `aria-expanded`, `aria-autocomplete="list"`, `aria-controls`
- Results list: `role="listbox"`, each result: `role="option"` with `aria-selected`
- Status region: `aria-live="polite"` announces result count on change (e.g. "3 results")

**Dir View**:
- Container: `role="navigation"` with `aria-label="Directory navigation"`
- Item list: `role="listbox"`, each item: `role="option"` with `aria-selected`

**Modal Sheet**:
- Overlay: `role="dialog"` with `aria-modal="true"` and `aria-labelledby`
- On open: focus moves to first focusable element within modal
- On close: focus returns to trigger element

---

## Theme Implementation

**Decision**: CSS custom properties on shadow root + `prefers-color-scheme` media query

**Rationale**: Define a `:host` CSS custom property set for light/dark. System mode uses `@media (prefers-color-scheme: dark)` within the shadow stylesheet. SolidJS reactive signal drives a data attribute (e.g. `data-theme="dark"`) on the shadow host for explicit overrides.

**OS change detection**: `window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ...)` triggers a store update when System theme is active.
