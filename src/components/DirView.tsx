import { createEffect, createMemo, createSignal, For, Match, onCleanup, onMount, Show, Switch } from 'solid-js';
import { debugMode } from '../debug';
import type { AppState, DirectoryItem, DirectoryNode, InputItem, NavEntry, VirtualItem } from '../types';
import type { SetStoreFunction } from 'solid-js/store';
import { read, write } from '../storage/persist';
import TitleBar from './TitleBar';
import Breadcrumbs from './Breadcrumbs';

const ITEMS_PER_PAGE = 9;
const MIN_WIDTH = 200;
const MIN_HEIGHT = 150;

interface EphemeralCtx {
  returnHistoryLength: number;
  onSelect?: (key: string, item: DirectoryItem) => void;
  /** Key of the currently-selected option; used to render a ✓ on select inputs. */
  selectedKey?: string;
}

interface InlineTextMode {
  key: string;
  nodePath: string[];
  item: InputItem;
}

interface MultiSelectMode {
  key: string;
  nodePath: string[];
  item: InputItem;
  selected: string[];
}

interface DirViewProps {
  state: AppState;
  set: SetStoreFunction<AppState>;
  keyPrefix: string;
  rootTree: DirectoryNode;
}

export default function DirView(props: DirViewProps) {
  let containerRef: HTMLDivElement | undefined;
  let dragging = false;
  let resizing = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  const [ephemeralCtx, setEphemeralCtx] = createSignal<EphemeralCtx | null>(null);
  const [inlineTextMode, setInlineTextMode] = createSignal<InlineTextMode | null>(null);
  const [inlineTextValue, setInlineTextValue] = createSignal('');
  const [multiSelectMode, setMultiSelectMode] = createSignal<MultiSelectMode | null>(null);
  // Bumped after any write() call so value-display spans re-read localStorage
  const [valueSeed, setValueSeed] = createSignal(0);

  // ── Nav history helpers ──────────────────────────────────────────────────

  const history = () => props.state.nav.history;
  const currentEntry = () => history()[history().length - 1];
  const currentNode = () => currentEntry()?.node ?? {};
  const navPath = () => history().slice(1).map((e) => e.key);
  const pathLabels = () => history().slice(1).map((e) => e.label);
  const canGoBack = () => history().length > 1 || inlineTextMode() !== null || multiSelectMode() !== null;

  /** Title shown in the TitleBar: overridden when editing an input inline. */
  const titleBarTitle = () => inlineTextMode()?.item.label ?? multiSelectMode()?.item.label ?? (currentEntry()?.label ?? 'Root');

  function itemCount(node: DirectoryNode) {
    return Math.max(1, Math.ceil(Object.keys(node).length / ITEMS_PER_PAGE));
  }

  function navigateInto(key: string, node: DirectoryNode, label: string) {
    const entry: NavEntry = { key, label, node };
    props.set('nav', (n) => ({ ...n, history: [...n.history, entry], page: 1, totalPages: itemCount(node) }));
  }

  function exitEphemeral(ctx: EphemeralCtx) {
    const returnHistory = history().slice(0, ctx.returnHistoryLength);
    const entry = returnHistory[returnHistory.length - 1];
    props.set('nav', (n) => ({ ...n, history: returnHistory, page: 1, totalPages: itemCount(entry?.node ?? {}) }));
    setEphemeralCtx(null);
    containerRef?.focus();
  }

  function navigateBack() {
    if (inlineTextMode()) { setInlineTextMode(null); containerRef?.focus(); return; }
    if (multiSelectMode()) { setMultiSelectMode(null); containerRef?.focus(); return; }

    const h = history();
    if (h.length <= 1) return;

    const ctx = ephemeralCtx();
    if (ctx && h.length <= ctx.returnHistoryLength + 1) { exitEphemeral(ctx); return; }

    const newHistory = h.slice(0, -1);
    const parentEntry = newHistory[newHistory.length - 1];
    props.set('nav', (n) => ({ ...n, history: newHistory, page: 1, totalPages: itemCount(parentEntry?.node ?? {}) }));
  }

  function navigateToBreadcrumb(index: number) {
    if (inlineTextMode()) { setInlineTextMode(null); return; }
    if (multiSelectMode()) { setMultiSelectMode(null); return; }

    const h = history();
    const targetHistory = index === -1 ? [h[0]] : h.slice(0, index + 2);
    const entry = targetHistory[targetHistory.length - 1];
    props.set('nav', (n) => ({ ...n, history: targetHistory, page: 1, totalPages: itemCount(entry?.node ?? {}) }));
    const ctx = ephemeralCtx();
    if (ctx && targetHistory.length <= ctx.returnHistoryLength) setEphemeralCtx(null);
  }

  // ── Window persistence ───────────────────────────────────────────────────

  onMount(() => {
    const stored = read<{ x: number; y: number; width: number; height: number }>(props.keyPrefix, 'window', 'state');
    if (stored) props.set('window', stored);
  });

  // Attach keyboard handler AFTER visible() flips — at that point <Show> has already
  // rendered the div and assigned containerRef. onMount fires before the div exists
  // (visible is false on initial mount) so we can't use it for this.
  createEffect(() => {
    if (!visible()) return;
    const el = containerRef;
    if (!el) return;
    el.addEventListener('keydown', handleKeyDown);
    onCleanup(() => el.removeEventListener('keydown', handleKeyDown));
  });

  createEffect(() => write(props.keyPrefix, 'window', 'state', props.state.window));

  // ── Item list memos ──────────────────────────────────────────────────────

  const currentItems = createMemo(() => Object.entries(currentNode()).map(([key, item]) => ({ key, item })));
  const totalPages = createMemo(() => Math.max(1, Math.ceil(currentItems().length / ITEMS_PER_PAGE)));
  const pageItems = createMemo(() => {
    const start = (props.state.nav.page - 1) * ITEMS_PER_PAGE;
    return currentItems().slice(start, start + ITEMS_PER_PAGE);
  });

  createEffect(() => {
    const total = totalPages();
    if (props.state.nav.totalPages !== total) props.set('nav', 'totalPages', total);
  });

  // ── Current-value display (reads localStorage, reactive via valueSeed) ──

  function getDisplayValue(key: string, item: InputItem): string {
    valueSeed(); // reactive dependency — re-reads after any write
    const stored = read<string | boolean | string[]>(props.keyPrefix, 'input', [...navPath(), key].join('.'));
    const value = stored !== null ? stored : item.defaultValue;
    if (value === undefined || value === null) return '';
    if (item.inputType === 'checkbox') return typeof value === 'boolean' ? (value ? '✓' : '○') : '';
    if (item.inputType === 'select-multiple') return Array.isArray(value) && value.length > 0 ? `${(value as string[]).join(', ')}` : '';
    return typeof value === 'string' ? value : '';
  }

  // ── Inline text accept / cancel ──────────────────────────────────────────

  function acceptInlineText() {
    const mode = inlineTextMode();
    if (!mode) return;
    const val = inlineTextValue();
    write(props.keyPrefix, 'input', mode.nodePath.join('.'), val);
    mode.item.onChange?.(val);
    setInlineTextMode(null);
    setValueSeed((s) => s + 1);
    containerRef?.focus();
  }

  // ── Multi-select accept ──────────────────────────────────────────────────

  function acceptMultiSelect() {
    const ms = multiSelectMode();
    if (!ms) return;
    write(props.keyPrefix, 'input', ms.nodePath.join('.'), ms.selected);
    ms.item.onChange?.(ms.selected);
    setMultiSelectMode(null);
    setValueSeed((s) => s + 1);
    containerRef?.focus();
  }

  function toggleMultiSelectOption(optIdx: number) {
    const ms = multiSelectMode();
    if (!ms) return;
    const opts = ms.item.options ?? [];
    if (optIdx >= opts.length) return;
    const opt = opts[optIdx];
    const next = ms.selected.includes(opt)
      ? ms.selected.filter((s) => s !== opt)
      : [...ms.selected, opt];
    setMultiSelectMode({ ...ms, selected: next });
  }

  // ── Item activation ──────────────────────────────────────────────────────

  function activateItem(entry: { key: string; item: DirectoryItem }) {
    const { key, item } = entry;
    const ctx = ephemeralCtx();

    if (item.type === 'directory') {
      navigateInto(key, item.children, item.label);
    } else if (item.type === 'action') {
      item.action();
      if (ctx) { ctx.onSelect?.(key, item); exitEphemeral(ctx); }
    } else if (item.type === 'input') {
      activateInputItem(key, item);
    } else if (item.type === 'virtual') {
      handleVirtualActivation(key, item);
    }
  }

  function activateInputItem(key: string, item: InputItem) {
    const nodePath = [...navPath(), key];
    const stored = read<string | boolean | string[]>(props.keyPrefix, 'input', nodePath.join('.'));

    if (item.inputType === 'checkbox') {
      const current = stored !== null ? (stored as boolean) : ((item.defaultValue as boolean) ?? false);
      const newVal = !current;
      write(props.keyPrefix, 'input', nodePath.join('.'), newVal);
      item.onChange?.(newVal);
      setValueSeed((s) => s + 1);

    } else if (item.inputType === 'text' || item.inputType === 'textarea') {
      const current = stored !== null ? (stored as string) : ((item.defaultValue as string) ?? '');
      setInlineTextValue(current);
      setInlineTextMode({ key, nodePath, item });

    } else if (item.inputType === 'select') {
      const current = stored !== null ? (stored as string) : ((item.defaultValue as string) ?? '');
      const options = item.options ?? [];
      const optionNode: DirectoryNode = {};
      for (const opt of options) {
        const capturedOpt = opt;
        optionNode[capturedOpt] = {
          type: 'action',
          label: capturedOpt,
          action: () => {
            write(props.keyPrefix, 'input', nodePath.join('.'), capturedOpt);
            item.onChange?.(capturedOpt);
            setValueSeed((s) => s + 1);
          },
        };
      }
      const returnHistoryLength = history().length;
      navigateInto(key, optionNode, item.label);
      setEphemeralCtx({ returnHistoryLength, selectedKey: current });

    } else if (item.inputType === 'select-multiple') {
      const current: string[] = stored !== null && Array.isArray(stored)
        ? (stored as string[])
        : (Array.isArray(item.defaultValue) ? (item.defaultValue as string[]) : []);
      setMultiSelectMode({ key, nodePath, item, selected: [...current] });
    }
  }

  function handleVirtualActivation(key: string, item: VirtualItem) {
    let cancelled = false;
    props.set('palette', 'overlay', { type: 'loading', item, nodeKey: key, cancel: () => { cancelled = true; } });

    item.load().then((subtree: DirectoryNode) => {
      if (cancelled) return;
      props.set('palette', 'overlay', null);
      if (item.mode === 'ephemeral') {
        const returnHistoryLength = history().length;
        navigateInto(key, subtree, item.label);
        setEphemeralCtx({ returnHistoryLength, onSelect: item.onSelect });
      } else {
        navigateInto(key, subtree, item.label);
      }
    }).catch((err: unknown) => {
      props.set('palette', 'overlay', { type: 'error', message: err instanceof Error ? err.message : 'Load failed.' });
    });
  }

  // ── Keyboard handler (direct addEventListener — bypasses SolidJS delegation) ─

  function handleKeyDown(e: KeyboardEvent) {
    if (props.state.mode !== 'dir' || !props.state.visible) return;

    // Let inline input/textarea handle their own events; only intercept Escape
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      if (e.key === 'Escape') {
        e.preventDefault();
        setInlineTextMode(null);
        containerRef?.focus();
      }
      return;
    }

    // Multi-select mode: intercept all keys
    if (multiSelectMode()) {
      if (e.key === 'Enter') { e.preventDefault(); acceptMultiSelect(); return; }
      if (e.key === 'Escape') { e.preventDefault(); setMultiSelectMode(null); containerRef?.focus(); return; }
      const numMatch = e.code.match(/^(?:Digit|Numpad)([1-9])$/);
      const num = numMatch ? parseInt(numMatch[1]) : NaN;
      if (!isNaN(num)) { e.preventDefault(); toggleMultiSelectOption(num - 1); }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      const ctx = ephemeralCtx();
      if (ctx) { exitEphemeral(ctx); } else { props.set('visible', false); }
      return;
    }

    if (e.key === 'Backspace') { e.preventDefault(); navigateBack(); return; }

    const numMatch = e.code.match(/^(?:Digit|Numpad)([1-9])$/);
    const num = numMatch ? parseInt(numMatch[1]) : NaN;
    if (!isNaN(num)) {
      e.preventDefault();
      const page = props.state.nav.page;
      const total = totalPages();
      if (num === 1 && page > 1) { props.set('nav', 'page', page - 1); return; }
      if (num === 9 && page < total) { props.set('nav', 'page', page + 1); return; }
      const idx = num - 1;
      const items = pageItems();
      if (idx < items.length) activateItem(items[idx]);
    }
  }

  // ── Drag ─────────────────────────────────────────────────────────────────

  function startDrag(e: MouseEvent) {
    if (!containerRef) return;
    dragging = true;
    const rect = containerRef.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    const onMove = (ev: MouseEvent) => {
      if (!dragging) return;
      props.set('window', (w) => ({
        ...w,
        x: Math.max(-w.width + 50, Math.min(ev.clientX - dragOffsetX, window.innerWidth - 50)),
        y: Math.max(0, Math.min(ev.clientY - dragOffsetY, window.innerHeight - 50)),
      }));
    };
    const onUp = () => { dragging = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  // ── Resize ────────────────────────────────────────────────────────────────

  function startResize(e: MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    resizing = true;
    const startX = e.clientX; const startY = e.clientY;
    const startW = props.state.window.width; const startH = props.state.window.height;
    const onMove = (ev: MouseEvent) => {
      if (!resizing) return;
      props.set('window', (w) => ({ ...w, width: Math.max(MIN_WIDTH, startW + (ev.clientX - startX)), height: Math.max(MIN_HEIGHT, startH + (ev.clientY - startY)) }));
    };
    const onUp = () => { resizing = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  function resetWindow() {
    props.set('window', {
      x: Math.round(window.innerWidth * 0.375), y: Math.round(window.innerHeight * 0.375),
      width: Math.round(window.innerWidth * 0.25), height: Math.round(window.innerHeight * 0.25),
    });
  }

  // ── Visibility & focus ────────────────────────────────────────────────────

  const visible = createMemo(() => props.state.visible && props.state.mode === 'dir');

  createEffect(() => {
    if (visible() && props.state.palette.overlay === null && !inlineTextMode()) containerRef?.focus();
  });

  createEffect(() => {
    if (!debugMode()) return;
    console.log(`[Rove:DirView:${props.keyPrefix}] visible=${visible()}`);
  });

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Show when={visible()}>
      <div
        ref={containerRef}
        class="dirview-container"
        role="navigation"
        aria-label="Directory navigator"
        tabIndex={0}
        style={{
          position: 'fixed',
          left: `${props.state.window.x}px`,
          top: `${props.state.window.y}px`,
          width: `${props.state.window.width}px`,
          height: `${props.state.window.height}px`,
          'z-index': 'var(--rove-z-index)',
          background: 'var(--rove-bg)',
          border: '1px solid var(--rove-border)',
          'border-radius': 'var(--rove-border-radius)',
          'box-shadow': 'var(--rove-shadow)',
          display: 'flex',
          'flex-direction': 'column',
          overflow: 'hidden',
          'min-width': `${MIN_WIDTH}px`,
          'min-height': `${MIN_HEIGHT}px`,
        }}
      >
        <TitleBar
          title={titleBarTitle()}
          canGoBack={canGoBack()}
          ephemeral={ephemeralCtx() !== null}
          onBack={navigateBack}
          onModeSwap={() => props.set('mode', 'palette')}
          onClose={() => props.set('visible', false)}
          onReset={resetWindow}
          onDragStart={startDrag}
        />

        <Breadcrumbs
          pathLabels={pathLabels()}
          onNavigateTo={navigateToBreadcrumb}
        />

        {/* ── Content area: switches between normal list / inline text / multi-select ── */}
        <Switch>

          {/* Inline text / textarea */}
          <Match when={inlineTextMode()}>
            {(mode) => (
              <div class="dirview-inline">
                <label class="dirview-inline-label">{mode().item.label}</label>
                <Show when={mode().item.inputType === 'textarea'}>
                  <textarea
                    class="dirview-inline-field"
                    ref={(el) => {
                      el.focus();
                      const len = el.value.length;
                      el.setSelectionRange(len, len);
                    }}
                    value={inlineTextValue()}
                    onInput={(e) => setInlineTextValue(e.currentTarget.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); acceptInlineText(); }
                    }}
                  />
                </Show>
                <Show when={mode().item.inputType === 'text'}>
                  <input
                    type="text"
                    class="dirview-inline-field"
                    ref={(el) => {
                      el.focus();
                      const len = el.value.length;
                      el.setSelectionRange(len, len);
                    }}
                    value={inlineTextValue()}
                    onInput={(e) => setInlineTextValue(e.currentTarget.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); acceptInlineText(); }
                    }}
                  />
                </Show>
                <span class="dirview-inline-hint">
                  {mode().item.inputType === 'textarea' ? 'Ctrl+Enter to save · Esc to cancel' : 'Enter to save · Esc to cancel'}
                </span>
              </div>
            )}
          </Match>

          {/* Inline multi-select */}
          <Match when={multiSelectMode()}>
            {(ms) => (
              <>
                <div role="listbox" style={{ flex: 1, 'overflow-y': 'auto', padding: '4px 0' }}>
                  <For each={ms().item.options ?? []}>
                    {(opt, i) => {
                      const checked = () => ms().selected.includes(opt);
                      return (
                        <div
                          role="option"
                          aria-selected={checked()}
                          onClick={() => toggleMultiSelectOption(i())}
                          style={{
                            display: 'flex', 'align-items': 'center', gap: '8px',
                            padding: '6px 12px', cursor: 'pointer', color: 'var(--rove-text)',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--rove-hover)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                        >
                          <span style={{ color: 'var(--rove-text-dim)', 'font-size': '11px', 'min-width': '14px' }}>{i() + 1}.</span>
                          <span style={{ 'min-width': '14px', 'font-size': '13px', color: checked() ? 'var(--rove-accent)' : 'var(--rove-text-dim)' }}>
                            {checked() ? '☑' : '☐'}
                          </span>
                          <span style={{ flex: 1 }}>{opt}</span>
                        </div>
                      );
                    }}
                  </For>
                </div>
                <div class="dirview-multiselect-footer">
                  {ms().selected.length} selected · Enter to save · Esc to cancel
                </div>
              </>
            )}
          </Match>

          {/* Normal item list */}
          <Match when={true}>
            <>
              <div role="listbox" class="dirview-items" style={{ flex: 1, 'overflow-y': 'auto', padding: '4px 0' }}>
                <For each={pageItems()}>
                  {(entry, i) => (
                    <div
                      class="dirview-item"
                      role="option"
                      aria-selected={false}
                      onClick={() => activateItem(entry)}
                      style={{
                        display: 'flex', 'align-items': 'center', gap: '8px',
                        padding: '6px 12px', cursor: 'pointer', color: 'var(--rove-text)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--rove-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                    >
                      <span style={{ color: 'var(--rove-text-dim)', 'font-size': '11px', 'min-width': '14px' }}>
                        {i() + 1}.
                      </span>
                      <span style={{ flex: 1 }}>
                        {'label' in entry.item ? entry.item.label : entry.key}
                      </span>
                      {/* Current value display for input items */}
                      <Show when={entry.item.type === 'input'}>
                        <span style={{
                          'font-size': '11px', color: 'var(--rove-text-dim)',
                          'max-width': '80px', overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap',
                        }}>
                          {getDisplayValue(entry.key, entry.item as InputItem)}
                        </span>
                      </Show>
                      {/* Checkmark for currently-selected option in select mode */}
                      <Show when={ephemeralCtx()?.selectedKey === entry.key}>
                        <span style={{ color: 'var(--rove-accent)', 'font-size': '13px' }}>✓</span>
                      </Show>
                      {/* Arrow indicator for navigable items */}
                      <Show when={entry.item.type === 'directory' || entry.item.type === 'virtual' || entry.item.type === 'input' && (entry.item as InputItem).inputType === 'select' || entry.item.type === 'input' && (entry.item as InputItem).inputType === 'select-multiple'}>
                        <span style={{ color: 'var(--rove-text-dim)' }}>→</span>
                      </Show>
                    </div>
                  )}
                </For>
              </div>

              <Show when={totalPages() > 1}>
                <div style={{ padding: '4px 12px', 'font-size': '11px', color: 'var(--rove-text-dim)', 'border-top': '1px solid var(--rove-border)', 'text-align': 'center' }}>
                  {props.state.nav.page}/{totalPages()}
                </div>
              </Show>
            </>
          </Match>
        </Switch>

        {/* Resize handle */}
        <div
          class="dirview-resize"
          onMouseDown={startResize}
          style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', cursor: 'se-resize', background: 'var(--rove-text-dim)', 'clip-path': 'polygon(100% 0, 100% 100%, 0 100%)', opacity: 0.4 }}
        />
      </div>
    </Show>
  );
}