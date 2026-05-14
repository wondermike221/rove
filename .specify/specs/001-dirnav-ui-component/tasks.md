# Tasks: [TBD] UI Component

**Input**: `.specify/specs/001-dirnav-ui-component/` (spec.md, plan.md, data-model.md, contracts/api.md, research.md)

**Tech stack**: SolidJS 1.9, TypeScript 5.8, uFuzzy, Vite 6, solid-transition-group

**Organization**: Tasks grouped by user story. Each phase is independently testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no dependency conflicts)
- **[Story]**: User story label from spec.md (US1–US8)
- No test tasks — not requested in spec

---

## Phase 1: Setup

**Purpose**: Project initialization, directory structure, build configuration

- [ ] T001 Remove old source files (src/DirectoryTree.ts, src/DirectoryNav.tsx) and clear src/index.ts exports
- [ ] T002 Create directory structure: src/store/, src/components/, src/meta/, src/search/, src/storage/, src/shortcuts/
- [ ] T003 [P] Install uFuzzy dependency and add to package.json devDependencies (bundled in output)
- [ ] T004 [P] Create vite.userscript.config.ts — IIFE build, SolidJS bundled, output dist/userscript/[tbd].user.js, assigns window.__TBD__
- [ ] T005 [P] Verify vite.config.ts library build (ESM + CJS, solid-js external, dts output) — update if needed

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, state, storage, search, and shortcut infrastructure — ALL user stories depend on this phase

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Define all public + internal TypeScript types in src/types.ts (ConsumerConfig, ConsumerDefaults, ComponentInstance, DirectoryNode, DirectoryItem union, DirectoryNodeItem, ActionItem, InputItem with InputType, VirtualItem, AppState, WindowState, PaletteState, NavigationState, MetaSettings, SearchResult, SearchIndex, OverlayState)
- [ ] T007 [P] Implement localStorage adapter in src/storage/persist.ts (read<T>(prefix, category, key): T | null, write(prefix, category, key, value): void, clear(prefix): void — all wrapped in try/catch for unavailable localStorage)
- [ ] T008 Implement root SolidJS store in src/store/app-state.ts using createStore<AppState> — initial state with sensible defaults, exported setters for each slice (setVisible, setMode, setWindow, setPalette, setNav, setMeta)
- [ ] T009 Implement config resolution in src/store/config.ts (merge ConsumerDefaults → localStorage meta.* keys → resolved MetaSettings; export resolveConfig(config: ConsumerConfig, prefix: string): MetaSettings)
- [ ] T010 [P] Implement shortcut registry in src/shortcuts/registry.ts (ShortcutRegistry class: registerGlobal(shortcut, id, handler), registerScoped(shortcut, id, handler), updateShortcut(id, newShortcut), destroy() — global listener on document, scoped listener fires only when shadow host or descendant has focus)
- [ ] T011 [P] Implement fuzzy search in src/search/fuzzy.ts (buildIndex(tree: DirectoryNode): SearchIndex traverses all leaf nodes building haystack[] + items[]; search(index, query): SearchResult[] wraps uFuzzy search + info + order; appendToIndex(index, subtree, pathPrefix): SearchIndex for virtual node results)

**Checkpoint**: All foundational modules exist and type-check cleanly — user story phases can now begin

---

## Phase 3: User Story 8 — Initialization, Configuration & Shadow DOM (P1) 🎯 MVP Entry Point

**Goal**: Consumer calls `init(config)`, component mounts in shadow DOM on document.body, returns ComponentInstance

**Independent Test**: `init({ keyPrefix: 'test', tree: {} })` → shadow root appears on body → inspect DOM → `[shadow-root]` present → no styles on host page → `init({ keyPrefix: 'test', tree: { meta: { type: 'action', label: 'x', action: () => {} } } })` → throws "reserved node key" → init with invalid type → throws descriptive error

- [ ] T012 [US8] Implement tree validation in src/index.ts (validateTree(tree): throws if 'meta' key present, throws on invalid node type string, throws on InputItem with select/select-multiple and missing options array, throws on defaultValue type mismatch)
- [ ] T013 [US8] Implement shadow DOM mounting in src/components/Root.tsx (create host div → appendChild to document.body → attachShadow({ mode: 'open' }) → create mount div inside shadow → render SolidJS component tree into mount div)
- [ ] T014 [P] [US8] Implement component stylesheet in src/components/Root.tsx (inject <style> into shadow root with CSS custom properties for light/dark tokens, :host selectors, --tbd-font-family/border-radius/z-index overrides, @media prefers-color-scheme for system theme)
- [ ] T015 [US8] Implement init() in src/index.ts (validate config → resolveConfig → createStore → mount Root → register global shortcut → return ComponentInstance with show/hide/toggle/destroy methods that manipulate AppState.visible)
- [ ] T016 [P] [US8] Export public API from src/index.ts (named exports: init, types) and assign window.__TBD__ = { init } for userscript IIFE build (conditioned on typeof window !== 'undefined' and IIFE build flag)

**Checkpoint**: init() mounts shadow DOM, returns valid ComponentInstance, throws correct errors on bad config

---

## Phase 4: User Story 1 — Command Palette Mode (P1) 🎯 MVP

**Goal**: Component opens in palette mode by default — search input + mode-swap button, fuzzy results, Enter activates leaf node

**Independent Test**: Call init() → show() → palette visible top-center → type partial label → fuzzy results appear → aria-live region announces count → ArrowDown moves selection → Enter on action node → palette resets to empty

- [ ] T017 [US1] Implement Palette component in src/components/Palette.tsx (div pinned top/bottom per MetaSettings.palettePin, CSS: position fixed, width ~50vw centered, role="combobox" wrapping input + results; mode-swap button; visible only when AppState.mode === 'palette' and AppState.visible)
- [ ] T018 [P] [US1] Implement PaletteResult component in src/components/PaletteResult.tsx (renders single SearchResult row: path context label dim, match label with character highlights from result.ranges, role="option", aria-selected)
- [ ] T019 [US1] Wire palette search in src/components/Palette.tsx (createEffect on AppState.palette.query → fuzzy.search(index, query) → setAppState('palette', 'results', results); ArrowUp/Down updates selectedIndex; Enter calls activateResult(selected))
- [ ] T020 [US1] Implement action node activation in src/components/Palette.tsx (activateResult: if item.type === 'action' → call item.action() → reset query + results; if item.type === 'input' → open ModalSheet overlay; if item.type === 'virtual' → start virtual load flow)
- [ ] T021 [US1] Add aria-live status region in src/components/Palette.tsx (hidden visually but announces result count on change: "N results" — role="status", aria-live="polite", aria-atomic="true")

**Checkpoint**: Palette opens, searches, selects, and activates action nodes. aria-live works.

---

## Phase 5: User Stories 2 & 4 — Directory View + Window Behavior (P1)

**Goal**: Dir view floating window renders directory contents with breadcrumbs, numbered items, pagination. Window is draggable, resizable, position/size persists.

**Independent Test**: Switch to dir view → floating window at 25vw×25vh centered → breadcrumbs show path → items numbered 1–9 → directory with >9 items → page indicator shows 1/N → drag title bar → window moves → resize handle → window resizes → close + reopen → position/size restored

- [ ] T022 [US2] Implement TitleBar component in src/components/TitleBar.tsx (renders back ← when path.length > 0 else >, centered dir name truncated with ellipsis, mode-swap button, close X, reset □; entire bar is drag handle via onMouseDown; ARIA: role="toolbar")
- [ ] T023 [US2] Implement Breadcrumbs component in src/components/Breadcrumbs.tsx (home icon always shown; if path.length > 2 show "🏠 / .. / parent / current"; if path.length <= 2 show full path; each segment is clickable button that navigates to that path index)
- [ ] T024 [US2] Implement DirView component in src/components/DirView.tsx (floating window: position absolute using AppState.window.x/y/width/height; renders TitleBar, Breadcrumbs, item list numbered 1–9 from current page; pagination x/y indicator when totalPages > 1; role="navigation", item list role="listbox")
- [ ] T025 [US4] Implement drag-to-move in src/components/DirView.tsx (onMouseDown on TitleBar starts drag: track offsetX/offsetY; onMouseMove on document updates AppState.window.x/y; onMouseUp stops drag; clamp to keep minimum visible area within viewport)
- [ ] T026 [US4] Implement resize handle in src/components/DirView.tsx (bottom-right corner div; onMouseDown starts resize; onMouseMove updates AppState.window.width/height with minimum 200px×150px; onMouseUp stops resize)
- [ ] T027 [US4] Implement window state persistence in src/storage/persist.ts + src/components/DirView.tsx (persist {prefix}.window.x/y/width/height on each change via createEffect; read and initialize AppState.window from localStorage on mount; default 25vw×25vh centered if no stored values)
- [ ] T028 [US2] Implement directory item navigation in src/components/DirView.tsx (clicking or pressing item number on directory node updates NavigationState.path + currentNode + resets to page 1; update Breadcrumbs; back button navigates path.slice(0,-1))

**Checkpoint**: Dir view window renders, drags, resizes, persists position. Breadcrumbs and pagination work. Can navigate into directories.

---

## Phase 6: User Story 3 — Mode Switching (P1)

**Goal**: Instant toggle between palette and dir view via button or focus-scoped shortcut

**Independent Test**: In palette mode → click mode-swap button → dir view opens instantly at last position → press mode-swap shortcut → palette appears → click away (unfocus) → press mode-swap shortcut → nothing happens

- [ ] T029 [US3] Implement mode toggle logic in src/store/app-state.ts (toggleMode(): flips AppState.mode between 'palette' and 'dir'; if rememberLastMode persist to {prefix}.meta.lastMode; ensure dir view restores position/size from localStorage on switch to 'dir')
- [ ] T030 [US3] Wire mode-swap button in src/components/Palette.tsx (onClick → toggleMode())
- [ ] T031 [US3] Wire mode-swap button in src/components/TitleBar.tsx (onClick → toggleMode())
- [ ] T032 [US3] Register mode-swap focus-scoped shortcut in src/shortcuts/registry.ts at init time (default: MetaSettings.modeSwapShortcut; calls toggleMode(); only fires when shadow host has focus)

**Checkpoint**: Mode swap button and shortcut both toggle modes instantly. Focus-scope enforced.

---

## Phase 7: User Story 5 — Keyboard Shortcuts (P1)

**Goal**: Global shortcut toggles visibility. All other shortcuts are focus-scoped and configurable.

**Independent Test**: Component hidden → press global shortcut → shows+focuses → press again → hides → show → click elsewhere (lose focus) → press mode-swap shortcut → nothing happens → refocus → press Esc → hides

- [ ] T033 [US5] Implement global shortcut handler in src/index.ts (register on document at init: hidden→show()+focus(); visible+unfocused→focus(); visible+focused→hide(); uses registry.registerGlobal with MetaSettings.globalShortcut)
- [ ] T034 [US5] Implement palette focus-scoped shortcuts in src/components/Palette.tsx (Esc: query non-empty → clear query; query empty → hide(); ArrowUp/Down already wired in T019; Enter already wired in T019)
- [ ] T035 [P] [US5] Implement dir view focus-scoped shortcuts in src/components/DirView.tsx (1–9: activateItem(n-1) or paginate if 1=prevPage/9=nextPage; Backspace: navigateUp() if path.length > 0; Esc: hide())
- [ ] T036 [P] [US5] Implement modal sheet focus-scoped shortcuts in src/components/ModalSheet.tsx (Ctrl+Enter: accept(); Esc: cancel/dismiss())
- [ ] T037 [US5] Expose shortcut update path from MetaSettings changes (registry.updateShortcut(id, newShortcut) called from config.ts when meta settings change globalShortcut or modeSwapShortcut)

**Checkpoint**: All shortcuts work. Non-global shortcuts do nothing when focus is outside component.

---

## Phase 8: User Story 6 — Node Types & Activation (P1)

**Goal**: All node types (directory, action, input×5, virtual) activate correctly with appropriate overlays in both modes

**Independent Test**: Activate action → callback runs → palette resets. Activate text input → modal sheet opens with text field focused → type + Ctrl+Enter → value saved to localStorage → sheet closes. Activate virtual → loading modal → Esc → sheet closes → fetch completes → palette index silently includes new nodes. Activate select node → native select in modal.

- [ ] T038 [US6] Implement ModalSheet component skeleton in src/components/ModalSheet.tsx (role="dialog", aria-modal="true", aria-labelledby; focus trap via Tab/Shift+Tab cycling within modal; Esc calls onCancel; position as modal sheet above palette using fixed overlay; onOpen moves focus to first focusable child; onClose restores focus to trigger element)
- [ ] T039 [P] [US6] Implement text + textarea input controls in src/components/ModalSheet.tsx (render native <input type="text"> or <textarea> based on item.inputType; pre-populate from localStorage or item.defaultValue; Ctrl+Enter calls onAccept(value); textarea: Enter inserts newline, Ctrl+Enter accepts)
- [ ] T040 [P] [US6] Implement checkbox input control in src/components/ModalSheet.tsx (render native <input type="checkbox">; pre-populate from localStorage or item.defaultValue; Ctrl+Enter calls onAccept(checked))
- [ ] T041 [P] [US6] Implement select + select-multiple input controls in src/components/ModalSheet.tsx (render native <select> or <select multiple>; populate options from item.options; pre-select from localStorage or item.defaultValue; Ctrl+Enter calls onAccept(value or values[]))
- [ ] T042 [US6] Implement input node activation in src/components/Palette.tsx + src/components/DirView.tsx (activateItem for input node: set AppState.palette.overlay to {type:'input', item, nodeKey, nodePath}; ModalSheet onAccept saves to {prefix}.input.{node-path} via persist.ts, calls item.onChange if defined, closes overlay; onCancel closes overlay)
- [ ] T043 [US6] Implement virtual node activation in src/components/Palette.tsx (activateItem for virtual: set overlay to {type:'loading', item, nodeKey, cancel}; call item.load(); Esc while loading sets overlay to null but fetch continues; on resolve call appendToIndex(index, result, pathPrefix) and rebuild palette results; on reject set overlay to {type:'error', message})
- [ ] T044 [US6] Implement virtual node activation in src/components/DirView.tsx (activateItem for virtual in dir view: same loading overlay flow; on resolve navigate into new virtual directory contents)

**Checkpoint**: All five input subtypes save values and close cleanly. Virtual nodes load in background after Esc. Action nodes fire and reset.

---

## Phase 9: User Story 7 — Meta Directory & User Settings (P2)

**Goal**: Auto-injected 'meta' directory is searchable and usable in both modes. Settings apply immediately and persist.

**Independent Test**: Type "meta" in palette → meta dir visible as path context → activate a meta item (e.g. theme) → modal sheet opens with select control → change to 'dark' → theme changes immediately → close + reopen → dark theme persists → meta dir always present regardless of consumer tree

- [ ] T047 [US7] Implement meta-tree builder in src/meta/meta-tree.ts (buildMetaTree(prefix, store, registry): DirectoryNode — creates InputItems for theme/mode/palette-pin/remember-mode/global-key/swap-key; each item has storageKey preset to {prefix}.meta.{key} and onChange that calls appropriate store setter or registry.updateShortcut immediately)
- [ ] T048 [US7] Inject meta node at init in src/index.ts (merge buildMetaTree(...) result into root DirectoryNode under 'meta' key before building search index; meta node excluded from consumer tree validation since it's library-injected)
- [ ] T049 [US7] Implement OS theme change listener in src/components/Root.tsx (window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handler); handler updates data-theme attribute on shadow host when MetaSettings.theme === 'system'; remove listener on destroy())
- [ ] T050 [US7] Wire data-theme attribute to AppState.meta.theme in src/components/Root.tsx (createEffect: when meta.theme changes → set host element data-theme attribute → CSS :host([data-theme="dark"]) rules take effect)

**Checkpoint**: Meta directory searchable in palette. Theme, mode, pin, shortcut settings all apply immediately and persist.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Hardening, accessibility audit, edge cases, multi-instance verification

- [ ] T051 [P] ARIA audit — verify role="combobox" on palette container, aria-live="polite" status region fires on every result change, role="dialog" + aria-modal="true" on ModalSheet, role="option" + aria-selected on all items (src/components/Palette.tsx, DirView.tsx, ModalSheet.tsx)
- [ ] T052 [P] Focus management verification — ModalSheet focus trap cycles correctly through focusable children; focus restores to trigger element on modal close; shadow host has tabindex="-1" so it can receive programmatic focus (src/components/Root.tsx, ModalSheet.tsx)
- [ ] T053 Viewport clamping for dir view — enforce minimum visible area: window x/y cannot place window more than (width - 50px) off any viewport edge (src/components/DirView.tsx, T025/T026 follow-up)
- [ ] T054 [P] CSS consumer override tokens — add --tbd-font-family, --tbd-border-radius, --tbd-z-index as :host-level custom properties that cascade into component (src/components/Root.tsx stylesheet)
- [ ] T055 Verify userscript IIFE build — run vite build --config vite.userscript.config.ts, confirm output is self-contained, window.__TBD__.init is callable, no external imports
- [ ] T056 [P] Multi-instance smoke test — create two init() calls with distinct keyPrefix and distinct globalShortcut in demo/index.html; verify each instance has isolated state and shortcuts don't conflict
- [ ] T057 [P] Clean up package.json — remove solid-js from peerDependencies for userscript build target; ensure library build still has solid-js as peer dep; update exports map if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **BLOCKS all user story phases**
- **Phase 3 (US8 — Init + Shadow DOM)**: Depends on Phase 2 — **BLOCKS Phases 4–9**
- **Phase 4 (US1 — Palette)**: Depends on Phase 3
- **Phase 5 (US2+4 — Dir View)**: Depends on Phase 3 — can run in parallel with Phase 4
- **Phase 6 (US3 — Mode Switch)**: Depends on Phases 4 AND 5
- **Phase 7 (US5 — Shortcuts)**: Depends on Phases 4, 5, and 6
- **Phase 8 (US6 — Node Types)**: Depends on Phases 4, 5, and 7
- **Phase 9 (US7 — Meta)**: Depends on Phase 8
- **Phase 10 (Polish)**: Depends on Phases 4–9

### User Story Dependencies

| Story | Phase | Depends On |
|-------|-------|-----------|
| US8 (Init + Shadow DOM) | 3 | Foundation |
| US1 (Palette) | 4 | US8 |
| US2+4 (Dir View + Window) | 5 | US8 |
| US3 (Mode Switch) | 6 | US1 + US2 |
| US5 (Shortcuts) | 7 | US3 |
| US6 (Node Types) | 8 | US1 + US5 |
| US7 (Meta) | 9 | US6 |

### Parallel Opportunities Within Phases

**Phase 2**: T007, T010, T011 can run in parallel (different files)

**Phase 3**: T014, T016 can run in parallel after T013

**Phase 4**: T018 can run in parallel with T017

**Phase 5**: T022, T023 can run in parallel; T025, T026 can run in parallel after T024

**Phase 8**: T039, T040, T041 can run in parallel after T038

**Phase 10**: T051, T052, T054, T056, T057 all parallelizable

---

## Parallel Example: Phase 5 (Dir View)

```
# Run in parallel after T021 (Palette checkpoint):
Task T022: "Implement TitleBar in src/components/TitleBar.tsx"
Task T023: "Implement Breadcrumbs in src/components/Breadcrumbs.tsx"

# After T022 + T023:
Task T024: "Implement DirView in src/components/DirView.tsx"

# After T024, run in parallel:
Task T025: "Implement drag-to-move"
Task T026: "Implement resize handle"
```

---

## Implementation Strategy

### MVP (User Stories 8 + 1 only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US8 — Init + Shadow DOM
4. Complete Phase 4: US1 — Command Palette
5. **STOP and VALIDATE**: init() mounts, palette opens, fuzzy search works, action nodes activate
6. Demo/test with a real userscript

### Incremental Delivery

1. MVP above → working palette (the primary mode)
2. Add Phase 5 (US2+4) → dir view functional
3. Add Phase 6 (US3) → mode switching works
4. Add Phase 7 (US5) → full keyboard control
5. Add Phase 8 (US6) → all node types + overlays
6. Add Phase 9 (US7) → meta settings
7. Phase 10 → ship

---

## Notes

- `[P]` = different files, no in-flight dependency conflicts
- `[USN]` = maps to user story N in spec.md
- No test tasks generated (not requested in spec)
- Story US2 and US4 share a phase — US4 (window behavior) is inseparable from US2's DirView component
- Virtual node Esc behavior (T043/T044): dismiss overlay, fetch continues, result appended on resolve — do NOT cancel the Promise
- Ctrl+Enter finalization deferred per spec clarifications — use Ctrl+Enter for all input types including textarea
- `[TBD]` name placeholder used throughout — replace when project name is finalized
