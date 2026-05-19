# Data Model: Rove UI Component

**Feature**: 001-dirnav-ui-component | **Date**: 2026-05-13

---

## Public API Types

### ConsumerConfig

```ts
interface ConsumerConfig {
  tree: DirectoryNode;
  keyPrefix: string;            // dot-notation namespace, e.g. "myapp.dirnav"
  defaults?: ConsumerDefaults;
}

interface ConsumerDefaults {
  mode?: 'palette' | 'dir';            // default: 'palette'
  palettePin?: 'top' | 'bottom';       // default: 'top'
  globalShortcut?: string;             // default: 'Ctrl+`'
  modeSwapShortcut?: string;           // default: 'Ctrl+Shift+`'
  rememberLastMode?: boolean;          // default: false
  theme?: 'light' | 'dark' | 'system'; // default: 'system'
}
```

### ComponentInstance (returned by `init()`)

```ts
interface ComponentInstance {
  show(): void;
  hide(): void;
  toggle(): void;
  destroy(): void;
}
```

---

## Node Types

### DirectoryNode

```ts
// Root type for consumer-provided tree and virtual node results.
// Key 'meta' is reserved — throws on init if present.
type DirectoryNode = Record<string, DirectoryItem>;
```

### DirectoryItem (discriminated union)

```ts
type DirectoryItem =
  | DirectoryNodeItem
  | ActionItem
  | InputItem
  | VirtualItem;
```

### DirectoryNodeItem

```ts
interface DirectoryNodeItem {
  type: 'directory';
  label: string;
  children: DirectoryNode;
}
```

### ActionItem

```ts
interface ActionItem {
  type: 'action';
  label: string;
  action: () => void;
}
```

### InputItem

```ts
type InputType = 'text' | 'textarea' | 'checkbox' | 'select' | 'select-multiple';

interface InputItem {
  type: 'input';
  label: string;
  inputType: InputType;
  options?: string[];                               // required for 'select' and 'select-multiple'
  defaultValue?: string | boolean | string[];
  storageKey?: string;                              // overrides auto-generated key
  onChange?: (value: string | boolean | string[]) => void;
}
```

**Validation rules**:
- `options` is required (non-empty) when `inputType` is `'select'` or `'select-multiple'`
- `defaultValue` type must match `inputType`: boolean for `'checkbox'`, string[] for `'select-multiple'`, string for all others

### VirtualItem

```ts
interface VirtualItem {
  type: 'virtual';
  label: string;
  load: () => Promise<DirectoryNode>;
}
```

**Behavior**:
- On activation: loading overlay shown, `load()` called
- On resolve: overlay dismissed (if still open), result appended to tree, palette index silently refreshed
- On Esc during load: overlay dismissed, fetch continues; result still appended on resolve
- On reject: error message shown in overlay, previous state maintained

---

## Internal State Types

### AppState (root SolidJS store)

```ts
interface AppState {
  visible: boolean;
  mode: 'palette' | 'dir';
  window: WindowState;
  palette: PaletteState;
  nav: NavigationState;
  meta: MetaSettings;
}
```

### WindowState

```ts
interface WindowState {
  x: number;        // px from viewport left
  y: number;        // px from viewport top
  width: number;    // px
  height: number;   // px
}

// Defaults: centered at 25vw × 25vh
```

### PaletteState

```ts
interface PaletteState {
  query: string;
  results: SearchResult[];
  selectedIndex: number;
  overlay: OverlayState | null;
}
```

### NavigationState

```ts
interface NavigationState {
  path: string[];             // node key sequence from root (empty = root)
  currentNode: DirectoryNode;
  page: number;               // 1-based
  totalPages: number;
}
```

### MetaSettings

```ts
interface MetaSettings {
  mode: 'palette' | 'dir';
  palettePin: 'top' | 'bottom';
  globalShortcut: string;
  modeSwapShortcut: string;
  rememberLastMode: boolean;
  theme: 'light' | 'dark' | 'system';
}
```

**Resolution order** (later wins):
1. Hardcoded defaults
2. `ConsumerDefaults` from `init()`
3. User overrides from localStorage (`{prefix}.meta.*`)

### SearchResult

```ts
interface SearchResult {
  item: DirectoryItem;        // the matched leaf node
  key: string;                // node key at its level
  path: string[];             // full key path from root (for display context)
  pathLabels: string[];       // human-readable label path for display
  score: number;              // uFuzzy relevance score (lower = better)
  ranges: [number, number][]; // character ranges for highlight rendering
}
```

**Scope**: All leaf nodes (`action`, `input`, `virtual`) are indexed. `directory` nodes contribute their labels to path context strings but are not directly activatable.

### OverlayState

```ts
type OverlayState =
  | { type: 'input'; item: InputItem; nodeKey: string; nodePath: string[] }
  | { type: 'loading'; item: VirtualItem; nodeKey: string; cancel: () => void }
  | { type: 'error'; message: string };
```

---

## Meta Directory (auto-injected)

Constructed internally as a `DirectoryNode` under the reserved key `meta`. Structure mirrors the component's own node types to use the same rendering pipeline.

```
meta/
├── theme          InputItem { inputType: 'select', options: ['system','light','dark'] }
├── mode           InputItem { inputType: 'select', options: ['palette','dir'] }
├── palette-pin    InputItem { inputType: 'select', options: ['top','bottom'] }
├── remember-mode  InputItem { inputType: 'checkbox' }
├── global-key     InputItem { inputType: 'text' }
└── swap-key       InputItem { inputType: 'text' }
```

Each meta `InputItem` has its `storageKey` pre-set to the corresponding `{prefix}.meta.*` key and an `onChange` that applies the setting immediately.

---

## Search Index

The flat search index is built at init time and rebuilt when virtual node results are appended.

```ts
interface SearchIndex {
  haystack: string[];       // one entry per leaf node: "label path > label"
  items: SearchResult[];    // parallel array — same index as haystack
}
```

Rebuilt triggers:
- Initial `init()` call (full tree traversal)
- Virtual node `load()` resolves (incremental append of new leaf paths)
