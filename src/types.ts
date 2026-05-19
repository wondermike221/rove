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
  | VirtualItem;

export interface DirectoryNodeItem {
  type: 'directory';
  label: string;
  children: DirectoryNode;
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

export interface VirtualItem {
  type: 'virtual';
  label: string;
  /**
   * persistent (default): loaded subtree is navigated into and cached in the
   * search index — user can return to it freely.
   *
   * ephemeral: loaded subtree is presented as a one-shot selection list.
   * After the user picks an item, onSelect fires and the nav returns to where
   * it was. The subtree is never added to the search index.
   */
  mode?: 'persistent' | 'ephemeral';
  load: () => Promise<DirectoryNode>;
  /** Called when an item is picked in ephemeral mode. */
  onSelect?: (key: string, item: DirectoryItem) => void;
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
   * currently-visible level. Using a stack lets virtual/ephemeral subtrees
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
  | { type: 'loading'; item: VirtualItem; nodeKey: string; cancel: () => void }
  | { type: 'error'; message: string };