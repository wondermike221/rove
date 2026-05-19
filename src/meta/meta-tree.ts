import type { DirectoryNodeItem, InputItem, MetaSettings } from '../types';
import type { SetStoreFunction } from 'solid-js/store';
import type { AppState } from '../types';
import type { ShortcutRegistry } from '../shortcuts/registry';
import { write } from '../storage/persist';
import { setMeta } from '../store/app-state';

export function buildMetaTree(
  prefix: string,
  set: SetStoreFunction<AppState>,
  registry: ShortcutRegistry,
): DirectoryNodeItem {
  function makeInput(
    label: string,
    inputType: InputItem['inputType'],
    metaKey: keyof MetaSettings,
    opts?: {
      options?: string[];
      onChange?: (value: string | boolean | string[]) => void;
    },
  ): InputItem {
    return {
      type: 'input',
      label,
      inputType,
      options: opts?.options,
      storageKey: `${prefix}.meta.${metaKey}`,
      onChange: (value) => {
        write(prefix, 'meta', metaKey, value);
        if (opts?.onChange) opts.onChange(value);
        setMeta(set, { [metaKey]: value } as Partial<MetaSettings>);
      },
    };
  }

  return {
    type: 'directory',
    label: 'Settings',
    children: {
      theme: makeInput('Theme', 'select', 'theme', {
        options: ['system', 'light', 'dark'],
      }),
      mode: makeInput('Default Mode', 'select', 'mode', {
        options: ['palette', 'dir'],
      }),
      'palette-pin': makeInput('Palette Pin', 'select', 'palettePin', {
        options: ['top', 'middle', 'bottom'],
      }),
      'remember-mode': makeInput('Remember Last Mode', 'checkbox', 'rememberLastMode'),
      'global-key': makeInput('Global Shortcut', 'text', 'globalShortcut', {
        onChange: (value) => {
          registry.updateShortcut('global-toggle', value as string);
        },
      }),
      'swap-key': makeInput('Mode Swap Shortcut', 'text', 'modeSwapShortcut', {
        onChange: (value) => {
          registry.updateShortcut('mode-swap', value as string);
        },
      }),
    },
  };
}
