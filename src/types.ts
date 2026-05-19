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
  load: () => Promise<DirectoryNode>;
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

export interface NavigationState {
  path: string[];
  currentNode: DirectoryNode;
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
