// ─── Public API types ──────────────────────────────────────────────────────

export interface ConsumerConfig {
  tree: DirectoryNode;
  keyPrefix: string;
  defaults?: ConsumerDefaults;
}

export interface ConsumerDefaults {
  mode?: 'palette' | 'dir';
  palettePin?: 'top' | 'middle' | 'bottom';
  globalShortcut?: string;
  modeSwapShortcut?: string;
  rememberLastMode?: boolean;
  theme?: 'light' | 'dark' | 'system';
}

export interface ComponentInstance {
  show(): void;
  hide(): void;
  toggle(): void;
  destroy(): void;
}

// ─── Node types ────────────────────────────────────────────────────────────

export type DirectoryNode = Record<string, DirectoryItem>;

export type DirectoryItem =
  | DirectoryNodeItem
  | ActionItem
  | InputItem
  | SelectItem;

export interface DirectoryNodeItem {
  type: 'directory';
  label: string;
  /**
   * Static children. Absent on a lazy directory before its first load.
   * After `load()` resolves, the library caches the result here so
   * subsequent activations navigate directly without re-loading.
   */
  children?: DirectoryNode;
  /**
   * Optional async loader. When present and `children` is absent, the node
   * acts as a lazy directory: the first activation triggers the load, the
   * result is cached into `children`, and the user is navigated in.
   * Subsequent activations behave like a normal static directory.
   */
  load?: () => Promise<DirectoryNode>;
}

export interface ActionItem {
  type: 'action';
  label: string;
  action: () => void;
}

export type InputType = 'text' | 'textarea' | 'checkbox' | 'select' | 'select-multiple';

export interface InputItem {
  type: 'input';
  label: string;
  inputType: InputType;
  options?: string[];
  defaultValue?: string | boolean | string[];
  storageKey?: string;
  onChange?: (value: string | boolean | string[]) => void;
}

/**
 * A one-shot selection widget. Presents a list of string options and fires
 * `onSelect` when the user picks one. Options can be static or async-loaded.
 *
 * In DirView: shown as an ephemeral navigation list — user picks, nav returns.
 * In palette: shown as an inline ephemeral pick list.
 */
export interface SelectItem {
  type: 'select';
  label: string;
  /** Static option list. Mutually exclusive with `load`. */
  options?: string[];
  /** Async option loader. Called every time the item is activated. */
  load?: () => Promise<string[]>;
  onSelect: (value: string) => void;
}

// ─── Internal state types ──────────────────────────────────────────────────

export interface AppState {
  visible: boolean;
  mode: 'palette' | 'dir';
  window: WindowState;
  palette: PaletteState;
  nav: NavigationState;
  meta: MetaSettings;
}

export interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PaletteState {
  query: string;
  results: SearchResult[];
  selectedIndex: number;
  overlay: OverlayState | null;
}

/** One entry in the DirView navigation history. */
export interface NavEntry {
  /** Key in the parent node that led to this level (empty string for root). */
  key: string;
  /** Display label for this level. */
  label: string;
  /** The directory contents at this level. */
  node: DirectoryNode;
}

export interface NavigationState {
  /**
   * Breadcrumb stack: history[0] is always the root, the last entry is the
   * currently-visible level. Using a stack lets lazy/ephemeral subtrees
   * navigate correctly without re-walking the static tree.
   */
  history: NavEntry[];
  page: number;
  totalPages: number;
}

export interface MetaSettings {
  mode: 'palette' | 'dir';
  palettePin: 'top' | 'middle' | 'bottom';
  globalShortcut: string;
  modeSwapShortcut: string;
  rememberLastMode: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface SearchResult {
  item: DirectoryItem;
  key: string;
  path: string[];
  pathLabels: string[];
  score: number;
  ranges: [number, number][];
}

export interface SearchIndex {
  haystack: string[];
  items: SearchResult[];
}

export type OverlayState =
  | { type: 'input'; item: InputItem; nodeKey: string; nodePath: string[] }
  | { type: 'loading'; label: string; cancel: () => void }
  | { type: 'error'; message: string };
