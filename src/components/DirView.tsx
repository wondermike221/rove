import { createEffect, createMemo, createSignal, For, onCleanup, onMount, Show } from 'solid-js';
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
  /** history.length at the moment we entered ephemeral — used to snap back. */
  returnHistoryLength: number;
  onSelect?: (key: string, item: DirectoryItem) => void;
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

  // ── Nav history helpers ──────────────────────────────────────────────────

  const history = () => props.state.nav.history;
  const currentEntry = () => history()[history().length - 1];
  const currentNode = () => currentEntry()?.node ?? {};
  const navPath = () => history().slice(1).map((e) => e.key);
  const pathLabels = () => history().slice(1).map((e) => e.label);
  const currentLabel = () => currentEntry()?.label ?? 'Root';
  const canGoBack = () => history().length > 1;

  function itemCount(node: DirectoryNode) {
    return Math.max(1, Math.ceil(Object.keys(node).length / ITEMS_PER_PAGE));
  }

  function navigateInto(key: string, node: DirectoryNode, label: string) {
    const entry: NavEntry = { key, label, node };
    props.set('nav', (n) => ({
      ...n,
      history: [...n.history, entry],
      page: 1,
      totalPages: itemCount(node),
    }));
  }

  function exitEphemeral(ctx: EphemeralCtx) {
    const returnHistory = history().slice(0, ctx.returnHistoryLength);
    const entry = returnHistory[returnHistory.length - 1];
    props.set('nav', (n) => ({
      ...n,
      history: returnHistory,
      page: 1,
      totalPages: itemCount(entry?.node ?? {}),
    }));
    setEphemeralCtx(null);
  }

  function navigateBack() {
    const h = history();
    if (h.length <= 1) return;

    const ctx = ephemeralCtx();
    if (ctx && h.length <= ctx.returnHistoryLength + 1) {
      exitEphemeral(ctx);
      return;
    }

    const newHistory = h.slice(0, -1);
    const parentEntry = newHistory[newHistory.length - 1];
    props.set('nav', (n) => ({
      ...n,
      history: newHistory,
      page: 1,
      totalPages: itemCount(parentEntry?.node ?? {}),
    }));
  }

  function navigateToBreadcrumb(index: number) {
    const h = history();
    // index -1 = root (history[0]), index 0 = first path segment (history[1]), etc.
    const targetHistory = index === -1 ? [h[0]] : h.slice(0, index + 2);
    const entry = targetHistory[targetHistory.length - 1];
    props.set('nav', (n) => ({
      ...n,
      history: targetHistory,
      page: 1,
      totalPages: itemCount(entry?.node ?? {}),
    }));
    // Exit ephemeral if we navigated before the ephemeral entry point
    const ctx = ephemeralCtx();
    if (ctx && targetHistory.length <= ctx.returnHistoryLength) {
      setEphemeralCtx(null);
    }
  }

  // ── Window persistence ───────────────────────────────────────────────────

  onMount(() => {
    const stored = read<{ x: number; y: number; width: number; height: number }>(
      props.keyPrefix, 'window', 'state',
    );
    if (stored) props.set('window', stored);
    containerRef?.addEventListener('keydown', handleKeyDown);
  });
  onCleanup(() => containerRef?.removeEventListener('keydown', handleKeyDown));

  createEffect(() => {
    const win = props.state.window;
    write(props.keyPrefix, 'window', 'state', win);
  });

  // ── Item list memos ──────────────────────────────────────────────────────

  const currentItems = createMemo(() =>
    Object.entries(currentNode()).map(([key, item]) => ({ key, item })),
  );

  const totalPages = createMemo(() =>
    Math.max(1, Math.ceil(currentItems().length / ITEMS_PER_PAGE)),
  );

  const pageItems = createMemo(() => {
    const page = props.state.nav.page;
    const start = (page - 1) * ITEMS_PER_PAGE;
    return currentItems().slice(start, start + ITEMS_PER_PAGE);
  });

  createEffect(() => {
    const total = totalPages();
    if (props.state.nav.totalPages !== total) {
      props.set('nav', 'totalPages', total);
    }
  });

  // ── Item activation ──────────────────────────────────────────────────────

  function activateItem(entry: { key: string; item: DirectoryItem }) {
    const { key, item } = entry;
    const ctx = ephemeralCtx();

    if (item.type === 'directory') {
      navigateInto(key, item.children, item.label);
    } else if (item.type === 'action') {
      item.action();
      if (ctx) {
        ctx.onSelect?.(key, item);
        exitEphemeral(ctx);
      }
    } else if (item.type === 'input') {
      const stored = read<string | boolean | string[]>(
        props.keyPrefix, 'input', [...navPath(), key].join('.'),
      );
      const itemWithStored: InputItem = stored !== null ? { ...item, defaultValue: stored } : item;
      props.set('palette', 'overlay', {
        type: 'input',
        item: itemWithStored,
        nodeKey: key,
        nodePath: [...navPath(), key],
      });
    } else if (item.type === 'virtual') {
      handleVirtualActivation(key, item);
    }
  }

  function handleVirtualActivation(key: string, item: VirtualItem) {
    let cancelled = false;
    props.set('palette', 'overlay', {
      type: 'loading',
      item,
      nodeKey: key,
      cancel: () => { cancelled = true; },
    });

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
      props.set('palette', 'overlay', {
        type: 'error',
        message: err instanceof Error ? err.message : 'Load failed.',
      });
    });
  }

  // ── Keyboard handler (attached via addEventListener to bypass SolidJS delegation) ─

  function handleKeyDown(e: KeyboardEvent) {
    if (props.state.mode !== 'dir' || !props.state.visible) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      const ctx = ephemeralCtx();
      if (ctx) {
        exitEphemeral(ctx);
      } else {
        props.set('visible', false);
      }
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      navigateBack();
      return;
    }

    const numMatch = e.code.match(/^(?:Digit|Numpad)([1-9])$/);
    const num = numMatch ? parseInt(numMatch[1]) : NaN;
    if (!isNaN(num)) {
      e.preventDefault();
      const page = props.state.nav.page;
      const total = totalPages();

      if (num === 1 && page > 1) {
        props.set('nav', 'page', page - 1);
        return;
      }
      if (num === 9 && page < total) {
        props.set('nav', 'page', page + 1);
        return;
      }

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
      const newX = ev.clientX - dragOffsetX;
      const newY = ev.clientY - dragOffsetY;
      const maxX = window.innerWidth - 50;
      const maxY = window.innerHeight - 50;
      props.set('window', (w) => ({
        ...w,
        x: Math.max(-w.width + 50, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      }));
    };
    const onUp = () => {
      dragging = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  // ── Resize ────────────────────────────────────────────────────────────────

  function startResize(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    resizing = true;
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = props.state.window.width;
    const startH = props.state.window.height;

    const onMove = (ev: MouseEvent) => {
      if (!resizing) return;
      const newW = Math.max(MIN_WIDTH, startW + (ev.clientX - startX));
      const newH = Math.max(MIN_HEIGHT, startH + (ev.clientY - startY));
      props.set('window', (w) => ({ ...w, width: newW, height: newH }));
    };
    const onUp = () => {
      resizing = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  function resetWindow() {
    props.set('window', {
      x: Math.round(window.innerWidth * 0.375),
      y: Math.round(window.innerHeight * 0.375),
      width: Math.round(window.innerWidth * 0.25),
      height: Math.round(window.innerHeight * 0.25),
    });
  }

  // ── Visibility & focus ────────────────────────────────────────────────────

  const visible = createMemo(() => props.state.visible && props.state.mode === 'dir');

  createEffect(() => {
    if (visible() && props.state.palette.overlay === null) containerRef?.focus();
  });

  createEffect(() => {
    if (!debugMode()) return;
    const v = visible();
    console.log(`[Rove:DirView:${props.keyPrefix}] visible=${v}`);
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
          title={currentLabel()}
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

        <div
          role="listbox"
          class="dirview-items"
          style={{ flex: 1, 'overflow-y': 'auto', padding: '4px 0' }}
        >
          <For each={pageItems()}>
            {(entry, i) => (
              <div
                class="dirview-item"
                role="option"
                aria-selected={false}
                onClick={() => activateItem(entry)}
                style={{
                  display: 'flex',
                  'align-items': 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  color: 'var(--rove-text)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--rove-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '')}
              >
                <span
                  class="dirview-item-num"
                  style={{ color: 'var(--rove-text-dim)', 'font-size': '11px', 'min-width': '14px' }}
                >
                  {i() + 1}.
                </span>
                <span class="dirview-item-label" style={{ flex: 1 }}>
                  {'label' in entry.item ? entry.item.label : entry.key}
                </span>
                <Show when={entry.item.type === 'directory' || entry.item.type === 'virtual'}>
                  <span style={{ color: 'var(--rove-text-dim)' }}>→</span>
                </Show>
              </div>
            )}
          </For>
        </div>

        <Show when={totalPages() > 1}>
          <div
            class="dirview-pagination"
            style={{
              padding: '4px 12px',
              'font-size': '11px',
              color: 'var(--rove-text-dim)',
              'border-top': '1px solid var(--rove-border)',
              'text-align': 'center',
            }}
          >
            {props.state.nav.page}/{totalPages()}
          </div>
        </Show>

        {/* Resize handle */}
        <div
          class="dirview-resize"
          onMouseDown={startResize}
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '12px',
            height: '12px',
            cursor: 'se-resize',
            background: 'var(--rove-text-dim)',
            'clip-path': 'polygon(100% 0, 100% 100%, 0 100%)',
            opacity: 0.4,
          }}
        />
      </div>
    </Show>
  );
}