# Public API Contract: Rove UI Component

**Feature**: 001-dirnav-ui-component | **Date**: 2026-05-13

---

## Entry Point

```ts
import { init } from 'rove';                 // ESM / host-app
// or
const { init } = window.__ROVE__;             // userscript IIFE global
```

---

## `init(config: ConsumerConfig): ComponentInstance`

Mounts the component into a shadow DOM on `document.body`. Returns a `ComponentInstance` handle. May be called multiple times with different `keyPrefix` values to run multiple independent instances.

### Parameters

See `data-model.md → ConsumerConfig` for full type definition.

### Returns

```ts
interface ComponentInstance {
  show(): void;     // Show and focus the component
  hide(): void;     // Hide the component
  toggle(): void;   // Toggle visibility (same logic as global shortcut)
  destroy(): void;  // Remove from DOM, clean up listeners, clear reactive state
}
```

### Example

```ts
const nav = init({
  keyPrefix: 'myapp.dirnav',
  defaults: {
    mode: 'palette',
    theme: 'system',
    globalShortcut: 'Ctrl+`',
  },
  tree: {
    settings: {
      type: 'directory',
      label: 'Settings',
      children: {
        theme: {
          type: 'action',
          label: 'Toggle Theme',
          action: () => document.body.classList.toggle('dark'),
        },
      },
    },
    search: {
      type: 'input',
      label: 'Search Site',
      inputType: 'text',
      onChange: (value) => window.location.href = `/search?q=${value}`,
    },
  },
});
```

---

## Errors

All errors are thrown synchronously during `init()`. No runtime error events.

| Condition | Message |
|-----------|---------|
| `meta` key in consumer tree | `"Rove: 'meta' is a reserved node key."` |
| Invalid `type` on any node | `"Rove: Invalid node type '{type}' on node '{key}'."` |
| Missing `keyPrefix` | `"Rove: 'keyPrefix' is required."` |
| `select`/`select-multiple` without `options` | `"Rove: InputItem '{key}' with inputType '{inputType}' requires a non-empty 'options' array."` |
| `defaultValue` type mismatch | `"Rove: InputItem '{key}' defaultValue type does not match inputType '{inputType}'."` |

---

## Node Activation Behavior by Mode

| Node Type | Palette Mode | Dir View Mode |
|-----------|-------------|--------------|
| `directory` | Not activatable (path context only) | Navigate into |
| `action` | Execute → reset palette | Execute |
| `input` | Open modal sheet → accept (Ctrl+Enter) / cancel (Esc) | Open modal sheet |
| `virtual` | Open loading overlay → load → index refresh | Open loading overlay → navigate into |

---

## Keyboard Shortcuts (defaults, all configurable)

| Shortcut | Scope | Behavior |
|----------|-------|---------|
| `Ctrl+\`` | Global | Hidden → show+focus; visible+unfocused → focus; visible+focused → hide |
| `Ctrl+Shift+\`` | Focus | Toggle mode (palette ↔ dir) |
| `1`–`9` | Focus (dir view) | Activate nth item; 1 = prev page (if page > 1); 9 = next page (if page < total) |
| `Backspace` | Focus (dir view) | Navigate up one level (no-op at root) |
| `↑` / `↓` | Focus (palette) | Move selection through results |
| `Enter` | Focus (palette) | Activate selected result |
| `Esc` | Focus | Palette: clear query → empty → hide; Dir view: hide |
| `Ctrl+Enter` | Focus (modal) | Accept input value |
| `Esc` | Focus (modal) | Cancel / dismiss (fetch continues for virtual) |

---

## Multi-Instance

Multiple instances may coexist on the same page. Each instance:
- Is isolated by its `keyPrefix` (no shared localStorage keys)
- Has its own shadow root and reactive state
- Requires a distinct `defaults.globalShortcut` to avoid shortcut conflicts

The library does not detect or prevent shortcut conflicts between instances. Consumer is responsible.

---

## Theming

The component exposes CSS custom properties on its shadow host for advanced consumer styling. All properties have defaults and are not required.

```css
/* Applied to the shadow host element */
--rove-font-family: inherit;
--rove-border-radius: 6px;
--rove-z-index: 999999;
```

Internal theme tokens (light/dark) are managed via CSS custom properties within the shadow stylesheet and are not overridable from outside the shadow root.

---

## Userscript Usage

The IIFE build exposes a global `window.__ROVE__` object containing `{ init }`. Include the script via `@require`:

```js
// ==UserScript==
// @name         My Script
// @require      https://github.com/[user]/rove/releases/latest/download/rove.user.js
// @grant        none
// ==/UserScript==

window.__ROVE__.init({ keyPrefix: 'myscript', tree: { ... } });
```
