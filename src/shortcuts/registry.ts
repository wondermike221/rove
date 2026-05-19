interface ShortcutEntry {
  shortcut: string;
  handler: (e: KeyboardEvent) => void;
  scope: 'global' | 'scoped';
}

// Maps shortcut key strings to KeyboardEvent.code values (layout-independent)
const SPECIAL_KEY_CODES: Record<string, string> = {
  '`': 'Backquote',
  '\\': 'Backslash',
  '[': 'BracketLeft',
  ']': 'BracketRight',
  ';': 'Semicolon',
  "'": 'Quote',
  ',': 'Comma',
  '.': 'Period',
  '/': 'Slash',
  '-': 'Minus',
  '=': 'Equal',
  ' ': 'Space',
};

function matchesShortcut(e: KeyboardEvent, shortcut: string): boolean {
  const parts = shortcut.split('+');
  const keyStr = parts[parts.length - 1];
  const ctrl = parts.includes('Ctrl');
  const shift = parts.includes('Shift');
  const alt = parts.includes('Alt');
  const meta = parts.includes('Meta');

  if (
    e.ctrlKey !== ctrl ||
    e.shiftKey !== shift ||
    e.altKey !== alt ||
    e.metaKey !== meta
  ) {
    return false;
  }

  // Letter / digit keys: use e.key (case-insensitive)
  if (keyStr.length === 1 && /[a-z0-9]/i.test(keyStr)) {
    return e.key.toLowerCase() === keyStr.toLowerCase();
  }

  // Special punctuation: use e.code (modifier-independent, layout-independent)
  const expectedCode = SPECIAL_KEY_CODES[keyStr];
  if (expectedCode) return e.code === expectedCode;

  // Named keys (Enter, Escape, F1–F12, ArrowUp, etc.)
  return e.key === keyStr;
}

export class ShortcutRegistry {
  private entries = new Map<string, ShortcutEntry>();
  private shadowHost: HTMLElement | null = null;
  private globalHandler: (e: KeyboardEvent) => void;
  private scopedHandler: (e: KeyboardEvent) => void;

  constructor() {
    this.globalHandler = (e: KeyboardEvent) => {
      for (const entry of this.entries.values()) {
        if (entry.scope === 'global' && matchesShortcut(e, entry.shortcut)) {
          entry.handler(e);
        }
      }
    };

    this.scopedHandler = (e: KeyboardEvent) => {
      if (!this.shadowHost) return;
      const active = document.activeElement;
      const hostFocused =
        active === this.shadowHost ||
        (this.shadowHost.shadowRoot?.activeElement != null);

      if (!hostFocused) return;

      for (const entry of this.entries.values()) {
        if (entry.scope === 'scoped' && matchesShortcut(e, entry.shortcut)) {
          entry.handler(e);
        }
      }
    };

    document.addEventListener('keydown', this.globalHandler, { capture: true });
    document.addEventListener('keydown', this.scopedHandler, { capture: true });
  }

  setShadowHost(host: HTMLElement): void {
    this.shadowHost = host;
  }

  registerGlobal(shortcut: string, id: string, handler: (e: KeyboardEvent) => void): void {
    this.entries.set(id, { shortcut, handler, scope: 'global' });
  }

  registerScoped(shortcut: string, id: string, handler: (e: KeyboardEvent) => void): void {
    this.entries.set(id, { shortcut, handler, scope: 'scoped' });
  }

  updateShortcut(id: string, newShortcut: string): void {
    const entry = this.entries.get(id);
    if (entry) {
      entry.shortcut = newShortcut;
    }
  }

  unregister(id: string): void {
    this.entries.delete(id);
  }

  destroy(): void {
    document.removeEventListener('keydown', this.globalHandler, { capture: true });
    document.removeEventListener('keydown', this.scopedHandler, { capture: true });
    this.entries.clear();
  }
}
