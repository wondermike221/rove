import { createEffect, createMemo, For, Show } from 'solid-js';
import { debugMode } from '../debug';
import type { AppState, DirectoryNode, InputItem, SearchIndex, SearchResult } from '../types';
import type { SetStoreFunction } from 'solid-js/store';
import { search, appendToIndex } from '../search/fuzzy';
import { read } from '../storage/persist';
import PaletteResult from './PaletteResult';

interface PaletteProps {
  state: AppState;
  set: SetStoreFunction<AppState>;
  keyPrefix: string;
  getIndex: () => SearchIndex;
  setIndex: (idx: SearchIndex) => void;
}

export default function Palette(props: PaletteProps) {
  let inputRef: HTMLInputElement | undefined;
  let statusRef: HTMLDivElement | undefined;

  createEffect(() => {
    if (visible() && props.state.palette.overlay === null) inputRef?.focus();
  });

  createEffect(() => {
    const query = props.state.palette.query;
    const results = query ? search(props.getIndex(), query) : [];
    props.set('palette', (p) => ({ ...p, results, selectedIndex: 0 }));
  });

  function handleInput(e: Event) {
    props.set('palette', 'query', (e.target as HTMLInputElement).value);
  }

  function handleKeyDown(e: KeyboardEvent) {
    const { results, selectedIndex } = props.state.palette;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      props.set('palette', 'selectedIndex', Math.min(selectedIndex + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      props.set('palette', 'selectedIndex', Math.max(selectedIndex - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = results[selectedIndex];
      if (selected) activateResult(selected);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (props.state.palette.query) {
        props.set('palette', 'query', '');
      } else {
        props.set('visible', false);
      }
    }
  }

  function activateResult(result: SearchResult) {
    const item = result.item;

    if (item.type === 'action') {
      item.action();
      props.set('palette', (p) => ({ ...p, query: '', results: [], selectedIndex: 0 }));
    } else if (item.type === 'input') {
      const stored = read<string | boolean | string[]>(props.keyPrefix, 'input', result.path.join('.'));
      const itemWithStored: InputItem = stored !== null
        ? { ...item, defaultValue: stored }
        : item;
      props.set('palette', (p) => ({ ...p, query: '', results: [], selectedIndex: 0, overlay: {
        type: 'input',
        item: itemWithStored,
        nodeKey: result.key,
        nodePath: result.path,
      }}));
    } else if (item.type === 'virtual') {
      let cancelled = false;
      const cancel = () => { cancelled = true; };

      props.set('palette', 'overlay', {
        type: 'loading',
        item,
        nodeKey: result.key,
        cancel,
      });

      item.load().then((subtreeResult: DirectoryNode) => {
        const newIndex = appendToIndex(
          props.getIndex(),
          subtreeResult,
          result.path,
          result.pathLabels,
        );
        props.setIndex(newIndex);
        if (!cancelled) {
          props.set('palette', 'overlay', null);
        }
        // Re-run search with updated index
        const query = props.state.palette.query;
        if (query) {
          const newResults = search(newIndex, query);
          props.set('palette', (p) => ({ ...p, results: newResults }));
        }
      }).catch((err: unknown) => {
        props.set('palette', 'overlay', {
          type: 'error',
          message: err instanceof Error ? err.message : 'Load failed.',
        });
      });
    }
  }

  const pin = () => props.state.meta.palettePin;
  const visible = createMemo(() => props.state.visible && props.state.mode === 'palette');

  createEffect(() => {
    if (!debugMode()) return;
    const v = visible();
    console.log(`[Rove:Palette:${props.keyPrefix}] visible=${v} (state.visible=${props.state.visible} state.mode=${props.state.mode})`);
  });

  return (
    <>
    <Show when={debugMode()}>
      <div style={{
        position: 'fixed',
        top: '8px',
        left: props.keyPrefix.length <= 4 ? '8px' : 'auto',
        right: props.keyPrefix.length <= 4 ? 'auto' : '8px',
        background: visible() ? '#00c853' : '#c62828',
        color: '#fff',
        'font-size': '10px',
        'font-family': 'monospace',
        padding: '3px 10px',
        'border-radius': '20px',
        'z-index': '99999999',
        'pointer-events': 'none',
        'line-height': '1.6',
      }}>
        P[{props.keyPrefix}] v.vis={String(props.state.visible)} v.mode={props.state.mode} memo={String(visible())}
      </div>
    </Show>
    <Show when={visible()}>
      <div
        class="palette-container"
        style={{
          position: 'fixed',
          top: pin() === 'top' ? '0' : pin() === 'middle' ? '50%' : 'auto',
          bottom: pin() === 'bottom' ? '0' : 'auto',
          left: '50%',
          transform: pin() === 'middle' ? 'translate(-50%, -50%)' : 'translateX(-50%)',
          width: '50vw',
          'max-width': '700px',
          'min-width': '300px',
          'z-index': 'var(--rove-z-index)',
          background: 'var(--rove-bg)',
          border: '1px solid var(--rove-border)',
          'border-radius': 'var(--rove-border-radius)',
          'box-shadow': 'var(--rove-shadow)',
        }}
        role="combobox"
        aria-expanded={true}
        aria-haspopup="listbox"
      >
        <Show when={debugMode()}>
          <div style={{ background: 'red', color: 'white', 'font-size': '10px', padding: '2px 6px', 'font-family': 'monospace' }}>
            DEBUG: palette mounted [{props.keyPrefix}] pin={pin()}
          </div>
        </Show>
        <div class="palette-input-row" style={{ display: 'flex', 'align-items': 'center' }}>
          <input
            ref={inputRef}
            type="text"
            class="palette-input"
            placeholder="Search…"
            value={props.state.palette.query}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            aria-autocomplete="list"
            aria-controls="palette-results"
            style={{
              flex: '1',
              padding: '10px 14px',
              border: 'none',
              background: 'transparent',
              color: 'var(--rove-text)',
              'font-size': '16px',
              outline: 'none',
              'min-width': '0',
            }}
          />
          <button
            class="palette-mode-btn"
            onClick={() => props.set('mode', 'dir')}
            aria-label="Switch to directory view"
            title="Switch to directory view"
            style={{
              background: 'none',
              border: 'none',
              'border-left': '1px solid var(--rove-border)',
              cursor: 'pointer',
              color: 'var(--rove-text-dim)',
              padding: '0 14px',
              'font-size': '15px',
              'line-height': '1',
              'align-self': 'stretch',
              display: 'flex',
              'align-items': 'center',
            }}
          >
            ☰
          </button>
        </div>

        <div
          ref={statusRef}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
            clip: 'rect(0,0,0,0)',
            'white-space': 'nowrap',
          }}
        >
          {props.state.palette.results.length > 0
            ? `${props.state.palette.results.length} results`
            : props.state.palette.query ? 'No results' : ''}
        </div>

        <div
          id="palette-results"
          role="listbox"
          style={{
            'max-height': '50vh',
            'overflow-y': 'auto',
            'border-top': props.state.palette.results.length > 0 ? '1px solid var(--rove-border)' : 'none',
          }}
        >
          <For each={props.state.palette.results}>
            {(result, i) => (
              <PaletteResult
                result={result}
                selected={i() === props.state.palette.selectedIndex}
                onActivate={() => activateResult(result)}
              />
            )}
          </For>
        </div>

      </div>
    </Show>
    </>
  );
}
