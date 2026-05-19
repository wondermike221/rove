import { createEffect, createMemo, For, onCleanup, onMount, Show } from 'solid-js';
import { debugMode } from '../debug';
import type { AppState, DirectoryItem, DirectoryNode, InputItem } from '../types';
import type { SetStoreFunction } from 'solid-js/store';
import { read, write } from '../storage/persist';
import TitleBar from './TitleBar';
import Breadcrumbs from './Breadcrumbs';

const ITEMS_PER_PAGE = 9;
const MIN_WIDTH = 200;
const MIN_HEIGHT = 150;

interface DirViewProps {
  state: AppState;
  set: SetStoreFunction<AppState>;
  keyPrefix: string;
  rootTree: DirectoryNode;
}

function walkPath(root: DirectoryNode, path: string[]): DirectoryNode {
  let node = root;
  for (const key of path) {
    const item = node[key];
    if (item?.type === 'directory') {
      node = item.children;
    } else {
      break;
    }
  }
  return node;
}

export default function DirView(props: DirViewProps) {
  let containerRef: HTMLDivElement | undefined;
  let dragging = false;
  let resizing = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  // Restore persisted window position on mount; wire keyboard handler directly
  // (bypasses SolidJS event delegation which breaks in shadow DOM)
  onMount(() => {
    const stored = read<{ x: number; y: number; width: number; height: number }>(
      props.keyPrefix, 'window', 'state',
    );
    if (stored) {
      props.set('window', stored);
    }
    containerRef?.addEventListener('keydown', handleKeyDown);
  });
  onCleanup(() => containerRef?.removeEventListener('keydown', handleKeyDown));

  // Persist window state on change
  createEffect(() => {
    const win = props.state.window;
    write(props.keyPrefix, 'window', 'state', win);
  });

  const currentItems = createMemo(() => {
    const node = props.state.nav.currentNode;
    return Object.entries(node).map(([key, item]) => ({ key, item }));
  });

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

  function navigateInto(key: string, node: DirectoryNode) {
    const newPath = [...props.state.nav.path, key];
    props.set('nav', {
      path: newPath,
      currentNode: node,
      page: 1,
      totalPages: Math.max(1, Math.ceil(Object.keys(node).length / ITEMS_PER_PAGE)),
    });
  }

  function navigateBack() {
    const path = props.state.nav.path;
    if (path.length === 0) return;
    const newPath = path.slice(0, -1);
    const node = walkPath(props.rootTree, newPath);
    props.set('nav', {
      path: newPath,
      currentNode: node,
      page: 1,
      totalPages: Math.max(1, Math.ceil(Object.keys(node).length / ITEMS_PER_PAGE)),
    });
  }

  function navigateToBreadcrumb(index: number) {
    const newPath = index === -1 ? [] : props.state.nav.path.slice(0, index + 1);
    const node = walkPath(props.rootTree, newPath);
    props.set('nav', {
      path: newPath,
      currentNode: node,
      page: 1,
      totalPages: Math.max(1, Math.ceil(Object.keys(node).length / ITEMS_PER_PAGE)),
    });
  }

  function activateItem(entry: { key: string; item: DirectoryItem }) {
    const { key, item } = entry;

    if (item.type === 'directory') {
      navigateInto(key, item.children);
    } else if (item.type === 'action') {
      item.action();
    } else if (item.type === 'input') {
      const stored = read<string | boolean | string[]>(props.keyPrefix, 'input', [...props.state.nav.path, key].join('.'));
      const itemWithStored: InputItem = stored !== null ? { ...item, defaultValue: stored } : item;
      props.set('palette', 'overlay', {
        type: 'input',
        item: itemWithStored,
        nodeKey: key,
        nodePath: [...props.state.nav.path, key],
      });
    } else if (item.type === 'virtual') {
      let cancelled = false;
      props.set('palette', 'overlay', {
        type: 'loading',
        item,
        nodeKey: key,
        cancel: () => { cancelled = true; },
      });

      item.load().then((subtree: DirectoryNode) => {
        if (!cancelled) {
          props.set('palette', 'overlay', null);
          navigateInto(key, subtree);
        }
      }).catch((err: unknown) => {
        props.set('palette', 'overlay', {
          type: 'error',
          message: err instanceof Error ? err.message : 'Load failed.',
        });
      });
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (props.state.mode !== 'dir' || !props.state.visible) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      props.set('visible', false);
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
      if (idx < items.length) {
        activateItem(items[idx]);
      }
    }
  }

  // Drag
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

  // Resize
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

  const currentLabel = createMemo(() => {
    const path = props.state.nav.path;
    if (path.length === 0) return 'Root';
    // Walk parent node to get the label of the last path segment
    const parentPath = path.slice(0, -1);
    const parentNode = walkPath(props.rootTree, parentPath);
    const lastKey = path[path.length - 1];
    const item = parentNode[lastKey];
    return item?.type === 'directory' ? item.label : lastKey;
  });

  const pathLabels = createMemo(() => {
    return props.state.nav.path.map((key, i) => {
      const parentNode = walkPath(props.rootTree, props.state.nav.path.slice(0, i));
      const item = parentNode[key];
      return item?.type === 'directory' ? item.label : key;
    });
  });

  const visible = createMemo(() => props.state.visible && props.state.mode === 'dir');

  createEffect(() => {
    if (visible() && props.state.palette.overlay === null) containerRef?.focus();
  });

  createEffect(() => {
    if (!debugMode()) return;
    const v = visible();
    console.log(`[Rove:DirView:${props.keyPrefix}] visible=${v} (state.visible=${props.state.visible} state.mode=${props.state.mode})`);
  });

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
          canGoBack={props.state.nav.path.length > 0}
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
          style={{
            flex: 1,
            'overflow-y': 'auto',
            padding: '4px 0',
          }}
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
                  style={{
                    color: 'var(--rove-text-dim)',
                    'font-size': '11px',
                    'min-width': '14px',
                  }}
                >
                  {i() + 1}.
                </span>
                <span class="dirview-item-label" style={{ flex: 1 }}>
                  {'label' in entry.item ? entry.item.label : entry.key}
                </span>
                <Show when={entry.item.type === 'directory'}>
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
