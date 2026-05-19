import { createEffect, onCleanup, Show } from 'solid-js';
import { render } from 'solid-js/web';
import type { AppState, DirectoryNode, SearchIndex } from '../types';
import type { SetStoreFunction } from 'solid-js/store';
import type { ShortcutRegistry } from '../shortcuts/registry';
import Palette from './Palette';
import DirView from './DirView';
import ModalSheet from './ModalSheet';
import { write } from '../storage/persist';
import { debugMode } from '../debug';

const STYLES = `
:host {
  --rove-font-family: system-ui, sans-serif;
  --rove-border-radius: 6px;
  --rove-z-index: 999999;
  /* Light theme defaults — overridden by data-theme attribute */
  --rove-bg: #ffffff;
  --rove-surface: #f5f5f5;
  --rove-border: #ddd;
  --rove-text: #1a1a1a;
  --rove-text-dim: #666;
  --rove-accent: #1565c0;
  --rove-hover: #f0f0f0;
  --rove-selected: #e3f2fd;
  --rove-input-bg: #fafafa;
  --rove-shadow: 0 8px 32px rgba(0,0,0,0.15);
}

:host([data-theme="dark"]) {
  --rove-bg: #1e1e1e;
  --rove-surface: #2d2d2d;
  --rove-border: #444;
  --rove-text: #e0e0e0;
  --rove-text-dim: #999;
  --rove-accent: #4fc3f7;
  --rove-hover: #3a3a3a;
  --rove-selected: #0d47a1;
  --rove-input-bg: #252525;
  --rove-shadow: 0 8px 32px rgba(0,0,0,0.6);
}

:host([data-theme="light"]) {
  --rove-bg: #ffffff;
  --rove-surface: #f5f5f5;
  --rove-border: #ddd;
  --rove-text: #1a1a1a;
  --rove-text-dim: #666;
  --rove-accent: #1565c0;
  --rove-hover: #f0f0f0;
  --rove-selected: #e3f2fd;
  --rove-input-bg: #fafafa;
  --rove-shadow: 0 8px 32px rgba(0,0,0,0.15);
}

*, *::before, *::after { box-sizing: border-box; }

.rove-root {
  font-family: var(--rove-font-family);
  font-size: 14px;
  color: var(--rove-text);
}

/* DirView focus ring */
.dirview-container:focus {
  outline: 2px solid var(--rove-accent);
  outline-offset: -2px;
}

/* Modal sheet */
.modal-input { display: flex; flex-direction: column; gap: 6px; }
.modal-label { font-size: 12px; font-weight: 600; color: var(--rove-text-dim); }
.modal-input-field {
  width: 100%; padding: 8px 10px; box-sizing: border-box;
  border: 1px solid var(--rove-border); border-radius: calc(var(--rove-border-radius) - 2px);
  background: var(--rove-input-bg); color: var(--rove-text);
  font-size: 14px; font-family: var(--rove-font-family); outline: none;
}
.modal-input-field:focus { border-color: var(--rove-accent); }
.modal-textarea { min-height: 80px; resize: vertical; }
.modal-input-checkbox { width: 16px; height: 16px; cursor: pointer; accent-color: var(--rove-accent); }
.modal-actions { display: flex; gap: 8px; margin-top: 16px; justify-content: flex-end; }
.modal-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px; border: 1px solid var(--rove-border);
  border-radius: calc(var(--rove-border-radius) - 2px);
  background: var(--rove-surface); color: var(--rove-text);
  font-size: 13px; font-family: var(--rove-font-family); cursor: pointer;
}
.modal-btn--primary { background: var(--rove-accent); color: #fff; border-color: var(--rove-accent); }
.modal-btn kbd {
  font-size: 10px; opacity: 0.7; background: rgba(0,0,0,0.15);
  padding: 1px 4px; border-radius: 3px; font-family: monospace;
}
.modal-loading, .modal-error {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 8px 0; color: var(--rove-text);
}
`;

export interface RootProps {
  state: AppState;
  set: SetStoreFunction<AppState>;
  registry: ShortcutRegistry;
  keyPrefix: string;
  onDestroy: () => void;
  getIndex: () => SearchIndex;
  setIndex: (idx: SearchIndex) => void;
  rootTree: DirectoryNode;
}

export function mountRoot(props: RootProps): { host: HTMLElement; dispose: () => void } {
  const host = document.createElement('div');
  host.setAttribute('id', `rove-host-${props.keyPrefix}`);
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  const styleEl = document.createElement('style');
  styleEl.textContent = STYLES;
  shadow.appendChild(styleEl);

  const mount = document.createElement('div');
  mount.className = 'rove-root';
  shadow.appendChild(mount);

  host.tabIndex = -1;
  props.registry.setShadowHost(host);

  // Apply theme before first render so CSS vars resolve on frame 0
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const initialTheme = props.state.meta.theme;
  host.setAttribute(
    'data-theme',
    initialTheme === 'system' ? (mq.matches ? 'dark' : 'light') : initialTheme,
  );

  const dispose = render(
    () => <RootComponent {...props} shadowHost={host} />,
    mount,
  );

  return { host, dispose };
}

interface RootComponentProps extends RootProps {
  shadowHost: HTMLElement;
}

function RootComponent(props: RootComponentProps) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');

  function applyTheme() {
    const theme = props.state.meta.theme;
    if (theme === 'system') {
      props.shadowHost.setAttribute('data-theme', mq.matches ? 'dark' : 'light');
    } else {
      props.shadowHost.setAttribute('data-theme', theme);
    }
  }

  createEffect(applyTheme);

  const mqHandler = () => {
    if (props.state.meta.theme === 'system') applyTheme();
  };
  mq.addEventListener('change', mqHandler);
  onCleanup(() => mq.removeEventListener('change', mqHandler));

  function handleOverlayAccept(value: string | boolean | string[]) {
    const overlay = props.state.palette.overlay;
    if (overlay?.type !== 'input') return;
    write(props.keyPrefix, 'input', overlay.nodePath.join('.'), value);
    if (overlay.item.onChange) overlay.item.onChange(value);
    props.set('palette', 'overlay', null);
  }

  function handleOverlayCancel() {
    props.set('palette', 'overlay', null);
  }

  return (
    <>
      <Palette
        state={props.state}
        set={props.set}
        keyPrefix={props.keyPrefix}
        getIndex={props.getIndex}
        setIndex={props.setIndex}
      />
      <DirView
        state={props.state}
        set={props.set}
        keyPrefix={props.keyPrefix}
        rootTree={props.rootTree}
      />
      <Show when={props.state.palette.overlay !== null}>
        <ModalSheet
          overlay={props.state.palette.overlay!}
          keyPrefix={props.keyPrefix}
          onAccept={handleOverlayAccept}
          onCancel={handleOverlayCancel}
        />
      </Show>
      <Show when={debugMode()}>
        <div
          style={{
            position: 'fixed',
            bottom: '4px',
            left: props.keyPrefix.length <= 4 ? '4px' : 'auto',
            right: props.keyPrefix.length <= 4 ? 'auto' : '4px',
            background: '#000',
            color: '#0f0',
            'font-size': '10px',
            'font-family': 'monospace',
            padding: '3px 8px',
            'z-index': '99999999',
            'pointer-events': 'none',
            'border-radius': '3px',
            border: '1px solid #0f0',
            'line-height': '1.8',
            opacity: '0.95',
          }}
        >
          <div>[{props.keyPrefix}] visible={String(props.state.visible)} mode={props.state.mode}</div>
          <div>theme={props.state.meta.theme} navDepth={props.state.nav.history.length - 1}</div>
          <div>palettePin={props.state.meta.palettePin} overlay={String(props.state.palette.overlay?.type ?? 'null')}</div>
        </div>
      </Show>
    </>
  );
}
