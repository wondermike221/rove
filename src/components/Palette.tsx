import { createEffect, createMemo, createSignal, For, Show } from 'solid-js';
import { debugMode } from '../debug';
import type { AppState, DirectoryItem, DirectoryNode, InputItem, SearchIndex, SearchResult } from '../types';
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

interface EphemeralOption {
  key: string;
  item: DirectoryItem;
}

interface PaletteEphemeral {
  options: EphemeralOption[];
  label: string;
  selectedIndex: number;
  onSelect?: (key: string, item: DirectoryItem) => void;
}

export default function Palette(props: PaletteProps) {
  let inputRef: HTMLInputElement | undefined;
  let statusRef: HTMLDivElement | undefined;

  const [paletteEphemeral, setPaletteEphemeral] = createSignal<PaletteEphemeral | null>(null);

  // Clear ephemeral when palette hides
  createEffect(() => {
    if (!visible()) setPaletteEphemeral(null);
  });

  createEffect(() => {
    if (visible() && props.state.palette.overlay === null) inputRef?.focus();
  });

  createEffect(() => {
    if (paletteEphemeral()) return; // ephemeral mode uses its own filtering
    const query = props.state.palette.query;
    const results = query ? search(props.getIndex(), query) : [];
    props.set('palette', (p) => ({ ...p, results, selectedIndex: 0 }));
  });

  // Ephemeral filtered options (substring match against label or key)
  const ephemeralFiltered = createMemo<EphemeralOption[]>(() => {
    const ctx = paletteEphemeral();
    if (!ctx) return [];
    const q = props.state.palette.query.toLowerCase();
    if (!q) return ctx.options;
    return ctx.options.filter(({ key, item }) =>
      ('label' in item ? item.label : key).toLowerCase().includes(q),
    );
  });

  function handleInput(e: Event) {
    const query = (e.target as HTMLInputElement).value;
    props.set('palette', 'query', query);
    // Reset ephemeral selected index when query changes
    setPaletteEphemeral((prev) => prev ? { ...prev, selectedIndex: 0 } : null);
  }

  function handleKeyDown(e: KeyboardEvent) {
    const eph = paletteEphemeral();

    if (eph) {
      const filtered = ephemeralFiltered();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setPaletteEphemeral((p) => p ? { ...p, selectedIndex: Math.min(p.selectedIndex + 1, filtered.length - 1) } : null);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setPaletteEphemeral((p) => p ? { ...p, selectedIndex: Math.max(p.selectedIndex - 1, 0) } : null);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filtered[eph.selectedIndex];
        if (selected) selectEphemeralOption(selected);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setPaletteEphemeral(null);
        props.set('palette', 'query', '');
      }
      return;
    }

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

  function selectEphemeralOption(opt: EphemeralOption) {
    const ctx = paletteEphemeral();
    ctx?.onSelect?.(opt.key, opt.item);
    setPaletteEphemeral(null);
    props.set('palette', (p) => ({ ...p, query: '', results: [], selectedIndex: 0 }));
  }

  function activateResult(result: SearchResult) {
    const item = result.item;

    if (item.type === 'action') {
      item.action();
      props.set('palette', (p) => ({ ...p, query: '', results: [], selectedIndex: 0 }));
      requestAnimationFrame(() => inputRef?.focus());
    } else if (item.type === 'input') {
      const stored = read<string | boolean | string[]>(props.keyPrefix, 'input', result.path.join('.'));
      const itemWithStored: InputItem = stored !== null ? { ...item, defaultValue: stored } : item;
      props.set('palette', (p) => ({
        ...p,
        query: '',
        results: [],
        selectedIndex: 0,
        overlay: { type: 'input', item: itemWithStored, nodeKey: result.key, nodePath: result.path },
      }));
    } else if (item.type === 'virtual') {
      let cancelled = false;
      props.set('palette', 'overlay', { type: 'loading', item, nodeKey: result.key, cancel: () => { cancelled = true; } });

      item.load().then((subtree: DirectoryNode) => {
        if (cancelled) return;
        props.set('palette', 'overlay', null);

        if (item.mode === 'ephemeral') {
          const options: EphemeralOption[] = Object.entries(subtree).map(([key, it]) => ({ key, item: it }));
          setPaletteEphemeral({ options, label: item.label, selectedIndex: 0, onSelect: item.onSelect });
          props.set('palette', (p) => ({ ...p, query: '', results: [], selectedIndex: 0 }));
        } else {
          const newIndex = appendToIndex(props.getIndex(), subtree, result.path, result.pathLabels);
          props.setIndex(newIndex);
          const query = props.state.palette.query;
          if (query) {
            const newResults = search(newIndex, query);
            props.set('palette', (p) => ({ ...p, results: newResults }));
          }
        }
      }).catch((err: unknown) => {
        props.set('palette', 'overlay', { type: 'error', message: err instanceof Error ? err.message : 'Load failed.' });
      });
    }
  }

  const pin = () => props.state.meta.palettePin;
  const visible = createMemo(() => props.state.visible && props.state.mode === 'palette');

  createEffect(() => {
    if (!debugMode()) return;
    console.log(`[Rove:Palette:${props.keyPrefix}] visible=${visible()}`);
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
        P[{props.keyPrefix}] vis={String(visible())} eph={paletteEphemeral() ? paletteEphemeral()!.label : 'none'}
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

        {/* Search / ephemeral header row */}
        <Show when={paletteEphemeral() !== null}>
          <div style={{
            padding: '6px 14px',
            'font-size': '11px',
            color: 'var(--rove-accent)',
            background: 'var(--rove-selected)',
            display: 'flex',
            'align-items': 'center',
            gap: '6px',
          }}>
            <span style={{ 'font-weight': '600' }}>Select: {paletteEphemeral()!.label}</span>
            <span style={{ color: 'var(--rove-text-dim)', 'margin-left': 'auto' }}>Esc to cancel</span>
          </div>
        </Show>

        <div class="palette-input-row" style={{ display: 'flex', 'align-items': 'center' }}>
          <input
            ref={inputRef}
            type="text"
            class="palette-input"
            placeholder={paletteEphemeral() ? 'Filter…' : 'Search…'}
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
          style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', 'white-space': 'nowrap' }}
        >
          {paletteEphemeral()
            ? `${ephemeralFiltered().length} options`
            : props.state.palette.results.length > 0
              ? `${props.state.palette.results.length} results`
              : props.state.palette.query ? 'No results' : ''}
        </div>

        {/* Ephemeral option list */}
        <Show when={paletteEphemeral() !== null}>
          <div
            id="palette-results"
            role="listbox"
            style={{ 'max-height': '50vh', 'overflow-y': 'auto', 'border-top': '1px solid var(--rove-border)' }}
          >
            <For each={ephemeralFiltered()}>
              {(opt, i) => {
                const selected = () => i() === (paletteEphemeral()?.selectedIndex ?? -1);
                return (
                  <div
                    role="option"
                    aria-selected={selected()}
                    onClick={() => selectEphemeralOption(opt)}
                    style={{
                      display: 'flex',
                      'align-items': 'center',
                      padding: '8px 14px',
                      cursor: 'pointer',
                      background: selected() ? 'var(--rove-selected)' : 'transparent',
                      color: 'var(--rove-text)',
                      'font-size': '14px',
                    }}
                    onMouseEnter={(e) => { if (!selected()) e.currentTarget.style.background = 'var(--rove-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = selected() ? 'var(--rove-selected)' : ''; }}
                  >
                    {'label' in opt.item ? opt.item.label : opt.key}
                  </div>
                );
              }}
            </For>
            <Show when={ephemeralFiltered().length === 0}>
              <div style={{ padding: '8px 14px', color: 'var(--rove-text-dim)', 'font-size': '13px' }}>
                No options match
              </div>
            </Show>
          </div>
        </Show>

        {/* Normal search results */}
        <Show when={paletteEphemeral() === null}>
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
        </Show>
      </div>
    </Show>
    </>
  );
}