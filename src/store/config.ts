import type { ConsumerConfig, MetaSettings } from '../types';
import { read } from '../storage/persist';

const HARDCODED_DEFAULTS: MetaSettings = {
  mode: 'palette',
  palettePin: 'top',
  globalShortcut: 'Ctrl+`',
  modeSwapShortcut: 'Ctrl+Shift+`',
  rememberLastMode: false,
  theme: 'system',
};

export function resolveConfig(config: ConsumerConfig): MetaSettings {
  const { keyPrefix, defaults = {} } = config;

  const merged: MetaSettings = {
    mode: defaults.mode ?? HARDCODED_DEFAULTS.mode,
    palettePin: defaults.palettePin ?? HARDCODED_DEFAULTS.palettePin,
    globalShortcut: defaults.globalShortcut ?? HARDCODED_DEFAULTS.globalShortcut,
    modeSwapShortcut: defaults.modeSwapShortcut ?? HARDCODED_DEFAULTS.modeSwapShortcut,
    rememberLastMode: defaults.rememberLastMode ?? HARDCODED_DEFAULTS.rememberLastMode,
    theme: defaults.theme ?? HARDCODED_DEFAULTS.theme,
  };

  // localStorage overrides (user settings)
  const storedMode = read<'palette' | 'dir'>(keyPrefix, 'meta', 'mode');
  if (storedMode === 'palette' || storedMode === 'dir') merged.mode = storedMode;

  const storedPin = read<'top' | 'middle' | 'bottom'>(keyPrefix, 'meta', 'palettePin');
  if (storedPin === 'top' || storedPin === 'middle' || storedPin === 'bottom') merged.palettePin = storedPin;

  const storedGlobal = read<string>(keyPrefix, 'meta', 'globalShortcut');
  if (storedGlobal) merged.globalShortcut = storedGlobal;

  const storedSwap = read<string>(keyPrefix, 'meta', 'modeSwapShortcut');
  if (storedSwap) merged.modeSwapShortcut = storedSwap;

  const storedRemember = read<boolean>(keyPrefix, 'meta', 'rememberLastMode');
  if (typeof storedRemember === 'boolean') merged.rememberLastMode = storedRemember;

  const storedTheme = read<'light' | 'dark' | 'system'>(keyPrefix, 'meta', 'theme');
  if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
    merged.theme = storedTheme;
  }

  return merged;
}
