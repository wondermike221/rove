import type { ComponentInstance, ConsumerConfig, DirectoryItem, DirectoryNode } from './types';
import { resolveConfig } from './store/config';
import { createAppStore } from './store/app-state';
import { ShortcutRegistry } from './shortcuts/registry';
import { buildIndex } from './search/fuzzy';
import { buildMetaTree } from './meta/meta-tree';
import { mountRoot } from './components/Root';
import { clear } from './storage/persist';

// ─── Validation ────────────────────────────────────────────────────────────

function validateNode(key: string, item: DirectoryItem): void {
  const validTypes = ['directory', 'action', 'input', 'virtual'];
  if (!validTypes.includes(item.type)) {
    throw new Error(`Rove: Invalid node type '${item.type}' on node '${key}'.`);
  }

  if (item.type === 'input') {
    if (
      (item.inputType === 'select' || item.inputType === 'select-multiple') &&
      (!item.options || item.options.length === 0)
    ) {
      throw new Error(
        `Rove: InputItem '${key}' with inputType '${item.inputType}' requires a non-empty 'options' array.`,
      );
    }

    if (item.defaultValue !== undefined) {
      if (item.inputType === 'checkbox' && typeof item.defaultValue !== 'boolean') {
        throw new Error(
          `Rove: InputItem '${key}' defaultValue type does not match inputType '${item.inputType}'.`,
        );
      }
      if (item.inputType === 'select-multiple' && !Array.isArray(item.defaultValue)) {
        throw new Error(
          `Rove: InputItem '${key}' defaultValue type does not match inputType '${item.inputType}'.`,
        );
      }
      if (
        (item.inputType === 'text' || item.inputType === 'textarea' || item.inputType === 'select') &&
        typeof item.defaultValue !== 'string'
      ) {
        throw new Error(
          `Rove: InputItem '${key}' defaultValue type does not match inputType '${item.inputType}'.`,
        );
      }
    }
  }

  if (item.type === 'directory') {
    validateTree(item.children);
  }
}

function validateTree(tree: DirectoryNode): void {
  if ('meta' in tree) {
    throw new Error(`Rove: 'meta' is a reserved node key.`);
  }
  for (const [key, item] of Object.entries(tree)) {
    validateNode(key, item);
  }
}

// ─── init() ────────────────────────────────────────────────────────────────

export function init(config: ConsumerConfig): ComponentInstance {
  if (!config.keyPrefix) {
    throw new Error(`Rove: 'keyPrefix' is required.`);
  }

  validateTree(config.tree);

  const meta = resolveConfig(config);
  const [state, set] = createAppStore(meta);
  const registry = new ShortcutRegistry();

  // Build full tree with injected meta node
  const metaNode = buildMetaTree(config.keyPrefix, set, registry);
  const fullTree: DirectoryNode = { ...config.tree, meta: metaNode };

  let searchIndex = buildIndex(fullTree);

  // Expose search index setter for virtual node resolution
  function getIndex() { return searchIndex; }
  function setIndex(idx: typeof searchIndex) { searchIndex = idx; }

  // Initialize nav before mount so first render has correct root node
  set('nav', {
    path: [],
    currentNode: fullTree,
    page: 1,
    totalPages: Math.max(1, Math.ceil(Object.keys(fullTree).length / 9)),
  });

  const { host, dispose } = mountRoot({
    state,
    set,
    registry,
    keyPrefix: config.keyPrefix,
    onDestroy: destroy,
    getIndex,
    setIndex,
    rootTree: fullTree,
  });

  // Global shortcut: palette = simple show/hide; dirnav = 3-state show→focus→hide
  registry.registerGlobal(meta.globalShortcut, 'global-toggle', (e) => {
    e.preventDefault();
    if (state.mode === 'palette') {
      set('visible', !state.visible);
    } else {
      if (!state.visible) {
        set('visible', true);
        requestAnimationFrame(() => {
          if (host.shadowRoot?.activeElement == null) host.focus();
        });
      } else if (document.activeElement !== host && host.shadowRoot?.activeElement == null) {
        const inner = host.shadowRoot?.querySelector<HTMLElement>(
          'input:not([type="hidden"]), textarea, [tabindex="0"]',
        );
        (inner ?? host).focus();
      } else {
        set('visible', false);
      }
    }
  });

  // Palette auto-hides on focus loss
  host.addEventListener('focusout', () => {
    if (state.mode !== 'palette' || !state.visible) return;
    requestAnimationFrame(() => {
      if (host.shadowRoot?.activeElement == null && document.activeElement !== host) {
        set('visible', false);
      }
    });
  });

  // Mode-swap focus-scoped shortcut
  registry.registerScoped(meta.modeSwapShortcut, 'mode-swap', (e) => {
    e.preventDefault();
    const next = state.mode === 'palette' ? 'dir' : 'palette';
    set('mode', next);
  });

  function show(): void {
    set('visible', true);
    // Component effects run synchronously and focus the inner input/container.
    // rAF fires after, only focusing the host if nothing inside grabbed focus.
    requestAnimationFrame(() => {
      if (host.shadowRoot?.activeElement == null) host.focus();
    });
  }

  function hide(): void {
    console.log(`[Rove:${config.keyPrefix}] hide() called — setting visible=false`);
    set('visible', false);
  }

  function toggle(): void {
    if (state.visible) hide(); else show();
  }

  function destroy(): void {
    registry.destroy();
    dispose();
    host.remove();
    clear(config.keyPrefix);
  }

  // Expose internal state for debugging — accessible as window.__rove_state_{prefix}
  (window as unknown as Record<string, unknown>)[`__rove_state_${config.keyPrefix}`] = state;
  (window as unknown as Record<string, unknown>)[`__rove_set_${config.keyPrefix}`] = set;
  (window as unknown as Record<string, unknown>)[`__rove_host_${config.keyPrefix}`] = host;

  return { show, hide, toggle, destroy };
}

// ─── Public re-exports ─────────────────────────────────────────────────────

export type {
  ComponentInstance,
  ConsumerConfig,
  ConsumerDefaults,
  DirectoryItem,
  DirectoryNode,
  DirectoryNodeItem,
  ActionItem,
  InputItem,
  InputType,
  VirtualItem,
} from './types';

// ─── Userscript global ─────────────────────────────────────────────────────

declare const __USERSCRIPT_BUILD__: boolean;
if (typeof window !== 'undefined' && typeof __USERSCRIPT_BUILD__ !== 'undefined' && __USERSCRIPT_BUILD__) {
  (window as unknown as Record<string, unknown>)['__ROVE__'] = { init };
}
