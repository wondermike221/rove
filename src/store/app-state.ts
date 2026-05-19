import { createStore, SetStoreFunction } from 'solid-js/store';
import type { AppState, MetaSettings, NavigationState, OverlayState, PaletteState, SearchResult, WindowState } from '../types';

const DEFAULT_META: MetaSettings = {
  mode: 'palette',
  palettePin: 'top',
  globalShortcut: 'Ctrl+`',
  modeSwapShortcut: 'Ctrl+Shift+`',
  rememberLastMode: false,
  theme: 'system',
};

function defaultWindowState(): WindowState {
  return {
    x: Math.round(window.innerWidth * 0.375),
    y: Math.round(window.innerHeight * 0.375),
    width: Math.round(window.innerWidth * 0.25),
    height: Math.round(window.innerHeight * 0.25),
  };
}

function defaultAppState(meta: MetaSettings): AppState {
  return {
    visible: false,
    mode: meta.mode,
    window: defaultWindowState(),
    palette: {
      query: '',
      results: [],
      selectedIndex: 0,
      overlay: null,
    },
    nav: {
      history: [],
      page: 1,
      totalPages: 1,
    },
    meta,
  };
}

export function createAppStore(meta: MetaSettings): [AppState, SetStoreFunction<AppState>] {
  return createStore<AppState>(defaultAppState(meta));
}

// Typed setter helpers (used by components to avoid repetitive casting)
export function setVisible(set: SetStoreFunction<AppState>, value: boolean): void {
  set('visible', value);
}

export function setMode(set: SetStoreFunction<AppState>, value: 'palette' | 'dir'): void {
  set('mode', value);
}

export function setWindow(set: SetStoreFunction<AppState>, update: Partial<WindowState>): void {
  set('window', (w) => ({ ...w, ...update }));
}

export function setPalette(set: SetStoreFunction<AppState>, update: Partial<PaletteState>): void {
  set('palette', (p) => ({ ...p, ...update }));
}

export function setPaletteResults(set: SetStoreFunction<AppState>, results: SearchResult[], selectedIndex = 0): void {
  set('palette', (p) => ({ ...p, results, selectedIndex }));
}

export function setPaletteOverlay(set: SetStoreFunction<AppState>, overlay: OverlayState | null): void {
  set('palette', 'overlay', overlay);
}

export function setNav(set: SetStoreFunction<AppState>, update: Partial<NavigationState>): void {
  set('nav', (n) => ({ ...n, ...update }));
}

// Unused exports kept for potential consumer use

export function setMeta(set: SetStoreFunction<AppState>, update: Partial<MetaSettings>): void {
  set('meta', (m) => ({ ...m, ...update }));
}
