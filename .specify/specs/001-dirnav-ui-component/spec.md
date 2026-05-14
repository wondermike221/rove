# Feature Specification: [TBD] UI Component

- **Feature Branch**: main
- **Created**: 2026-05-13
- **Revised**: 2026-05-13
- **Status**: Draft

---

## Overview

[TBD] is a framework-agnostic floating UI component built with SolidJS internally and distributed as a vanilla JS library. It provides two interaction modes — a **command palette** (default) and a **directory view** — switchable at any time. It embeds via shadow DOM to avoid style collisions with the host page.

---

## Clarifications

### Session 2026-05-13

- Q: What level of accessibility support is required? → A: ARIA essentials — roles, live regions for search results, managed focus trapping in overlays. No full WCAG audit target.
- Q: Is there a tree size limit for fuzzy search performance? → A: Soft advisory only — no enforcement. Documented tested ceiling: ~500 total nodes. Consumer responsible beyond that.
- Q: What does Esc do during virtual node loading overlay? → A: Dismisses overlay; fetch continues in background. On resolve, result is appended to tree and palette index silently refreshes.
- Q: What format should localStorage keys use? → A: Dot notation — `{prefix}.{setting}` (e.g. `myapp.dirnav.theme`).
- Q: Can multiple instances coexist on the same page? → A: Yes — each instance isolated by key prefix. Consumer responsible for using distinct global shortcuts per instance.

---

## User Scenarios & Testing

### Story 1 (P1): Command Palette Mode — Primary Interface

A user opens the component and sees a clean command palette pinned to the top-center of the screen. They type to fuzzy search, use arrow keys to move through results, and press Enter to activate a leaf node.

- **Independent Test**: Open component → palette appears pinned top-center → type partial node name → fuzzy results appear including dirs as path context → arrow keys move selection → Enter activates leaf → palette resets to empty.

**Acceptance Scenarios**

- **Given** no prior mode preference, **When** the component opens, **Then** command palette mode is shown.
- **Given** palette mode is active, **When** it renders, **Then** only a search input and a mode-swap button are shown — no other chrome.
- **Given** the user types in the search field, **When** input changes, **Then** fuzzy search runs across the full tree (dir names provide path context) and results are sorted by relevance.
- **Given** search results are shown, **When** the user presses Arrow Up/Down, **Then** selection moves through results.
- **Given** a leaf node result is selected, **When** the user presses Enter, **Then** the node is activated and the palette resets to empty.
- **Given** the search field has text, **When** the user presses Esc, **Then** the search term is cleared.
- **Given** the search field is empty, **When** the user presses Esc, **Then** the component hides.
- **Given** no results match the search term, **When** the list renders, **Then** an empty state message is shown.

**Edge Cases**
- Single character search — still returns relevant results.
- Dir nodes appear in results for path context but cannot be directly activated; only leaf nodes can be activated.

---

### Story 2 (P1): Directory View Mode — Secondary Interface

A user switches to directory view to browse the tree hierarchically using keyboard shortcuts and numbered items.

- **Independent Test**: Switch to dir view → floating window appears at last known position/size → breadcrumbs show current path → numbered items 1–9 visible → press 9 on last item to advance page → page indicator shows `2/3` → press 1 on first item to go back.

**Acceptance Scenarios**

- **Given** dir view is active, **When** it renders, **Then** a floating window with full chrome is shown: back button (←) or command palette indicator (>), current directory name centered, mode-swap button, close (X), reset (□), and a drag-handle title bar.
- **Given** the user is not at root, **When** the title bar renders, **Then** a back button (←) is shown top-left.
- **Given** the user is at root, **When** the title bar renders, **Then** a (>) indicator is shown top-left.
- **Given** directory has 9 or fewer items, **When** viewed, **Then** all items are displayed numbered 1–9, no pagination.
- **Given** directory has more than 9 items, **When** viewed, **Then** items are paginated at 9 per page with an `x/y` page indicator.
- **Given** pagination is active and not on the first page, **When** the user presses 1, **Then** the previous page is shown.
- **Given** pagination is active and not on the last page, **When** the user presses 9, **Then** the next page is shown.
- **Given** the path is 2 levels or fewer deep, **When** breadcrumbs render, **Then** the full path is shown.
- **Given** the path is deeper than 2 levels, **When** breadcrumbs render, **Then** breadcrumbs show `🏠 / .. / parent / current`.
- **Given** a breadcrumb segment is clicked, **When** activated, **Then** the component navigates to that directory level.

**Edge Cases**
- Very long directory names in title bar — truncate with ellipsis.
- Pressing a number key when fewer items than that number exist — no action.
- Pressing back at root — no action.

---

### Story 3 (P1): Mode Switching

A user switches between palette and dir view seamlessly using a button or keyboard shortcut.

- **Independent Test**: In palette mode → click mode-swap button → dir view opens at last saved position/size instantly → press mode-swap shortcut → palette appears → no intermediate state.

**Acceptance Scenarios**

- **Given** palette mode is active, **When** the user clicks the mode-swap button or presses the mode-swap shortcut, **Then** dir view opens instantly at the last saved position and size.
- **Given** dir view is active, **When** the user clicks the mode-swap button (in title bar) or presses the mode-swap shortcut, **Then** palette mode opens instantly.
- **Given** the component has never been used in dir view, **When** switching to dir view for the first time, **Then** the window opens at default dimensions (25vw × 25vh) centered.
- **Given** the mode-swap shortcut is pressed, **When** the component does not have focus, **Then** nothing happens.

**Edge Cases**
- Rapid toggling — each switch is discrete, no animation queuing.

---

### Story 4 (P1): Floating Window Behavior (Dir View)

A user positions and resizes the dir view window and expects it to persist across sessions.

- **Independent Test**: Drag title bar → window follows cursor → drag resize handle → window resizes → close → reopen → position and size restored.

**Acceptance Scenarios**

- **Given** dir view is active, **When** the user drags the title bar, **Then** the window follows the cursor.
- **Given** dir view is active, **When** the user drags the bottom-right resize handle, **Then** the window resizes accordingly.
- **Given** the user has repositioned and resized the window, **When** the component is closed and reopened, **Then** position and size are restored.
- **Given** the user clicks the close button (X), **When** clicked, **Then** the window hides.
- **Given** the user clicks the reset button (□), **When** clicked, **Then** the window resets to default size (25vw × 25vh) centered.

**Edge Cases**
- Window dragged partially off-screen — remains accessible (minimum visible area enforced).
- localStorage unavailable — graceful fallback to defaults.

---

### Story 5 (P1): Global and Focus-Scoped Keyboard Shortcuts

A user navigates entirely by keyboard with predictable, conflict-free shortcuts.

- **Independent Test**: Component hidden → press global shortcut → shows and focuses → press global shortcut again → hides → show again → type in palette → press mode-swap shortcut → switches mode → press Esc → hides. Verify: pressing mode-swap shortcut while component is unfocused does nothing.

**Acceptance Scenarios**

- **Given** the component is hidden, **When** the user presses the global shortcut (default: Ctrl+`), **Then** the component shows and receives focus.
- **Given** the component is visible but not focused, **When** the user presses the global shortcut, **Then** the component receives focus.
- **Given** the component is visible and focused, **When** the user presses the global shortcut, **Then** the component hides.
- **Given** the component has focus and dir view is active, **When** the user presses 1–9, **Then** the corresponding item is selected/activated.
- **Given** the component has focus and dir view is active, **When** the user presses Backspace, **Then** the component navigates up one directory.
- **Given** the component has focus, **When** the user presses the mode-swap shortcut, **Then** the mode switches.
- **Given** the component does not have focus, **When** the user presses any focus-scoped shortcut, **Then** nothing happens.

**Edge Cases**
- All non-global shortcuts are strictly focus-scoped — no global side effects.
- All shortcuts (global and focus-scoped) are configurable at both consumer and end-user level.

---

### Story 6 (P1): Node Types and Activation

A developer builds a tree with all supported node types and each activates correctly in both modes.

- **Independent Test**: Tree with directory, action, text input, textarea, checkbox, select, select-multiple, virtual nodes → activate each in palette mode → verify correct overlay or behavior per type.

**Acceptance Scenarios**

- **Given** a `directory` node is activated in dir view, **When** selected, **Then** the component navigates into it.
- **Given** a `directory` node appears in palette search results, **When** present, **Then** it provides path context only and cannot be directly activated.
- **Given** an `action` node is activated, **When** selected, **Then** the associated callback executes and the palette resets to empty (fire-and-forget).
- **Given** an `input` node (any sub-type) is activated in palette mode, **When** selected, **Then** a modal sheet appears above the palette with the appropriate form control focused.
- **Given** an input modal sheet is open, **When** the user presses Ctrl+Enter, **Then** the value is saved to localStorage and the sheet closes, resetting the palette.
- **Given** an input modal sheet is open, **When** the user presses Esc, **Then** the operation is cancelled and the sheet closes.
- **Given** a `virtual` node is activated, **When** selected, **Then** a loading modal sheet appears, the async fetch runs, and on resolve the palette resets with the virtual directory's contents available for fuzzy search.
- **Given** a `virtual` node fetch fails, **When** the error occurs, **Then** an error message is shown in the modal sheet and previous state is maintained.
- **Given** the loading modal sheet is open, **When** the user presses Esc, **Then** the overlay is dismissed but the fetch continues in background; on resolve the result is appended to the tree and the palette index silently refreshes.

**Input Sub-Types**
All input nodes use native HTML form elements:
- `text` — single-line text input
- `textarea` — multiline text input
- `checkbox` — boolean toggle
- `select` — single-choice dropdown
- `select-multiple` — multi-choice select

**Edge Cases**
- Input node with no `defaultValue` — field starts empty.
- `textarea` requires Ctrl+Enter to accept (Enter inserts newline).

---

### Story 7 (P2): Meta Directory and User Settings

A user accesses the auto-injected meta directory to configure their personal preferences for the component.

- **Independent Test**: Open palette → type "meta" → meta dir appears → activate → meta settings visible as nodes → change default mode to "dir view" → close → reopen → dir view is now default.

**Acceptance Scenarios**

- **Given** any component instance, **When** initialized, **Then** a `meta` directory node is always present and auto-injected (not part of consumer tree).
- **Given** the user accesses meta, **When** viewed, **Then** the following settings are configurable: default mode, palette pin position (top/bottom), mode-swap shortcut, global shortcut, remember-last-mode (on/off).
- **Given** the user enables remember-last-mode, **When** the component is closed and reopened, **Then** it opens in the mode last used.
- **Given** the user changes a setting, **When** applied, **Then** it persists to localStorage and takes effect immediately.
- **Given** the component loads, **When** initializing, **Then** user settings from localStorage are restored and take precedence over consumer defaults.
- **Given** theme settings are shown in meta, **When** the user selects Light/Dark/System, **Then** the theme applies immediately and persists.
- **Given** System theme is selected, **When** the OS theme changes, **Then** the component reflects the change in real time.

**Edge Cases**
- `meta` is a reserved key — consumer trees cannot use it as a node key.
- localStorage unavailable — meta settings fall back to consumer defaults.

---

### Story 8 (P1): Initialization, Configuration, and Shadow DOM

A developer initializes the component with a tree, a key prefix, and optional defaults.

- **Independent Test**: Initialize with valid tree and key prefix → component mounts in shadow DOM on `document.body` → inspect DOM → shadow root present → no style leakage → initialize with `meta` as a tree key → initialization throws descriptive error.

**Acceptance Scenarios**

- **Given** a valid directory tree and a key prefix, **When** the component initializes, **Then** it mounts inside a shadow DOM appended to `document.body`.
- **Given** the component mounts, **When** attached to the DOM, **Then** no styles leak to or from the host page.
- **Given** two instances are initialized with distinct key prefixes and distinct global shortcuts, **When** both mount, **Then** each operates independently with isolated state.
- **Given** a consumer provides a default mode, palette position, or shortcut configuration, **When** the component initializes, **Then** those values are used as defaults (overridable by end user via meta).
- **Given** a consumer tree contains `meta` as a node key, **When** the component initializes, **Then** it throws a descriptive error.
- **Given** an invalid node type in the tree, **When** the component initializes, **Then** it throws a descriptive validation error.

**Consumer Config Shape (instantiation)**
```ts
{
  tree: DirectoryNode;           // required
  keyPrefix: string;             // required — dot-notation namespace, e.g. "myapp.dirnav"
  defaults?: {
    mode?: 'palette' | 'dir';   // default: 'palette'
    palettePin?: 'top' | 'bottom'; // default: 'top'
    globalShortcut?: string;    // default: 'Ctrl+`'
    modeSwapShortcut?: string;  // default: configurable
    rememberLastMode?: boolean; // default: false
    theme?: 'light' | 'dark' | 'system'; // default: 'system'
  };
}
```

---

## Requirements

### Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-001 | System MUST default to command palette mode unless overridden by consumer config or end-user meta setting. |
| FR-002 | System MUST support two modes: command palette and directory view, switchable at any time via button or focus-scoped shortcut. |
| FR-003 | System MUST render command palette as a clean pinned overlay (input + mode-swap button only, no chrome) at configurable top or bottom center position. |
| FR-004 | System MUST render directory view as a draggable, resizable floating window (25vw × 25vh default) with full title bar chrome including mode-swap button. |
| FR-005 | System MUST restore dir view position and size from localStorage on mode switch or reopen. |
| FR-006 | System MUST support one global shortcut (default: Ctrl+`) with contextual behavior: hidden→show+focus, visible+unfocused→focus, visible+focused→hide. |
| FR-007 | System MUST scope all non-global shortcuts strictly to when the component has focus. |
| FR-008 | System MUST support configurable shortcuts at both consumer (instantiation) and end-user (meta dir) levels. |
| FR-009 | System MUST provide fuzzy search in palette mode across the full tree; dir names provide path context but only leaf nodes are activatable. |
| FR-010 | System MUST support five node types: `directory`, `action`, `input` (sub-typed), `virtual`. |
| FR-011 | System MUST support native HTML input sub-types for input nodes: `text`, `textarea`, `checkbox`, `select`, `select-multiple`. |
| FR-012 | System MUST show a modal sheet above the palette for input node activation; accept via Ctrl+Enter, cancel via Esc. |
| FR-013 | System MUST execute action nodes fire-and-forget and reset the palette to empty immediately. |
| FR-014 | System MUST show a loading modal sheet for virtual node activation, then reset palette with virtual dir contents on resolve. |
| FR-015 | System MUST auto-inject a `meta` directory node (reserved key) containing all end-user configurable settings. |
| FR-016 | System MUST support Light/Dark/System theme switching via meta, persisted to localStorage, with real-time OS theme sync when System is active. |
| FR-017 | System MUST paginate directory view at 9 items per page (unlimited pages), using items 1 and 9 as prev/next shortcuts, with `x/y` page indicator. |
| FR-018 | System MUST show breadcrumbs with last two path segments; prefix `🏠 / ..` if path is deeper than 2 levels. |
| FR-019 | System MUST persist all state to localStorage under a consumer-provided key prefix. |
| FR-020 | System MUST embed in shadow DOM appended to `document.body` for style isolation. |
| FR-021 | System MUST throw descriptive errors on initialization if `meta` is used as a tree key or if invalid node types are present. |
| FR-022 | System MUST implement ARIA essentials: appropriate roles on palette/dir view containers, `aria-live="polite"` region for fuzzy search results, and managed focus trapping within modal sheet overlays. |

### Key Entities

- `DirectoryNode` — map of string keys to `DirectoryItem` union types. Key `meta` is reserved.
- `DirectoryItem` — discriminated union: `directory`, `action`, `input`, `virtual`.
- `InputNode` — sub-typed: `text`, `textarea`, `checkbox`, `select`, `select-multiple`.
- `NavigationState` — current path, directory, page, total pages.
- `WindowState` — position, size, visibility, focus.
- `CommandPaletteState` — active flag, search term, filtered results, selected index.
- `ModeState` — current mode (`palette` | `dir`), last-used mode.
- `MetaSettings` — user-level config: default mode, palette pin, shortcuts, remember-last-mode, theme.
- `ConsumerConfig` — instantiation-level config: tree, keyPrefix, defaults.

---

## Success Criteria

| ID | Criterion |
|----|-----------|
| SC-001 | A user can find and activate any leaf node in the tree by typing a partial name in the palette — no mouse required after component is open. |
| SC-002 | Keyboard-only navigation is possible in both modes with no mouse interaction required. |
| SC-003 | Switching between palette and dir view is instant with no visual artifacts or state loss. |
| SC-004 | All shortcuts (global and focus-scoped) are configurable by both consumer and end user without code changes. |
| SC-005 | Component initializes inside shadow DOM with no style leakage to or from the host page. |
| SC-006 | All user preferences persist across sessions via namespaced localStorage keys. |
| SC-007 | Palette search results are announced to screen readers via an `aria-live` region; focus is trapped within modal sheet overlays until dismissed. |

---

## Assumptions

- Component is used in userscripts or web applications where the author controls initialization.
- Host page may have arbitrary styles — shadow DOM isolation is non-negotiable.
- Users have a modern browser with ES2020+ support (no IE/legacy compatibility required).
- Directory trees are author-defined at initialization time; runtime tree mutation is out of scope.
- Persistence adapter (e.g. GM_setValue) is out of scope — localStorage is sufficient for now.
- No npm registration — distributed via GitHub with a userscript-ready bundle.
- Fuzzy search has no enforced tree size limit. Advisory ceiling is ~500 total nodes; performance beyond that is consumer's responsibility.
- Multiple instances may coexist on the same page, each isolated by its `keyPrefix`. Consumer is responsible for assigning distinct global shortcuts per instance to avoid conflicts.
- Internal implementation uses SolidJS; external API is framework-agnostic vanilla JS.
- Action node done-callback/promise (for loading state) is deferred to a future version.
- Consumer config locking (preventing end-user override of specific settings) is out of scope.
- Custom input sub-types beyond native HTML elements are deferred to a future version.
