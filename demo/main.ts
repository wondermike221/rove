import { init } from '../src/index';
import { setDebugMode } from '../src/debug';

// ─── Log helper ─────────────────────────────────────────────────────────────

function log(msg: string) {
  const el = document.getElementById('log')!;
  const entry = document.createElement('div');
  entry.className = 'log-entry new';
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  el.prepend(entry);
  setTimeout(() => entry.classList.remove('new'), 1500);
  const entries = el.querySelectorAll('.log-entry');
  if (entries.length > 20) entries[entries.length - 1].remove();
}

// ─── Instance 1 — full feature demo ─────────────────────────────────────────

const nav = init({
  keyPrefix: 'demo',
  defaults: {
    mode: 'palette',
    globalShortcut: 'Ctrl+`',
    modeSwapShortcut: 'Ctrl+Shift+`',
    theme: 'system',
    palettePin: 'top',
  },
  tree: {
    app: {
      type: 'directory',
      label: 'App',
      children: {
        settings: {
          type: 'directory',
          label: 'Settings',
          children: {
            theme: {
              type: 'action',
              label: 'Toggle Page Theme',
              action: () => {
                document.body.style.background =
                  document.body.style.background === 'rgb(255, 255, 255)'
                    ? '#0f1117'
                    : '#ffffff';
                document.body.style.color =
                  document.body.style.color === 'rgb(26, 26, 26)'
                    ? '#e0e0e0'
                    : '#1a1a1a';
                log('Toggled page theme');
              },
            },
            notifications: {
              type: 'input',
              label: 'Enable Notifications',
              inputType: 'checkbox',
              defaultValue: false,
              onChange: (v) => log(`Notifications: ${v}`),
            },
            language: {
              type: 'input',
              label: 'Language',
              inputType: 'select',
              options: ['English', 'Spanish', 'French', 'Japanese', 'German'],
              defaultValue: 'English',
              onChange: (v) => log(`Language set to: ${v}`),
            },
            interests: {
              type: 'input',
              label: 'Interests (multi-select)',
              inputType: 'select-multiple',
              options: ['Design', 'Engineering', 'Product', 'Data', 'DevOps'],
              onChange: (v) => log(`Interests: ${(v as string[]).join(', ')}`),
            },
          },
        },
        profile: {
          type: 'directory',
          label: 'Profile',
          children: {
            username: {
              type: 'input',
              label: 'Username',
              inputType: 'text',
              defaultValue: 'user',
              onChange: (v) => log(`Username changed to: ${v}`),
            },
            bio: {
              type: 'input',
              label: 'Bio',
              inputType: 'textarea',
              defaultValue: '',
              onChange: (v) => log(`Bio saved (${String(v).length} chars)`),
            },
          },
        },
      },
    },

    'new-task': {
      type: 'action',
      label: 'New Task',
      action: () => log('New task created!'),
    },

    search: {
      type: 'input',
      label: 'Search Site',
      inputType: 'text',
      onChange: (v) => {
        log(`Search: "${v}"`);
      },
    },

    docs: {
      type: 'directory',
      label: 'Load Documentation',
      load: () =>
        new Promise((resolve) => {
          log('Loading docs… (lazy directory — loads once, cached thereafter)');
          setTimeout(() => {
            log('Docs loaded! Results shown immediately.');
            resolve({
              'getting-started': {
                type: 'action',
                label: 'Getting Started',
                action: () => log('Opened: Getting Started'),
              },
              'api-reference': {
                type: 'action',
                label: 'API Reference',
                action: () => log('Opened: API Reference'),
              },
              examples: {
                type: 'action',
                label: 'Examples',
                action: () => log('Opened: Examples'),
              },
            });
          }, 1500);
        }),
    },

    'assign-user': {
      type: 'select',
      label: 'Assign User',
      load: () =>
        new Promise((resolve) => {
          log('Fetching users… (select — pick one and done)');
          setTimeout(() => {
            log('Users loaded!');
            resolve(['Alice', 'Bob', 'Carol', 'Dave']);
          }, 800);
        }),
      onSelect: (value) => log(`Assigned to: ${value}`),
    },

    github: {
      type: 'action',
      label: 'Open GitHub',
      action: () => {
        log('Opening GitHub…');
        window.open('https://github.com', '_blank');
      },
    },

    // ── Pagination test items (need >9 at same level for page 2) ────────────
    // Root now has 10 items → 2 pages. Key 9 on page 1 = next, key 1 on page 2 = prev.

    reports: {
      type: 'action',
      label: 'View Reports',
      action: () => log('Viewing reports'),
    },

    invite: {
      type: 'action',
      label: 'Invite User',
      action: () => log('Invite sent'),
    },

    logout: {
      type: 'action',
      label: 'Log Out',
      action: () => log('Logged out'),
    },

    help: {
      type: 'action',
      label: 'Help',
      action: () => log('Opening help'),
    },

    // Sub-directory with 20 items → 3 pages of pagination
    'big-menu': {
      type: 'directory',
      label: 'Pagination Test (20 items)',
      children: Object.fromEntries(
        Array.from({ length: 20 }, (_, i) => [
          `item-${i + 1}`,
          {
            type: 'action' as const,
            label: `Item ${i + 1}`,
            action: () => log(`Selected: Item ${i + 1}`),
          },
        ])
      ),
    },
  },
});

// ─── Instance 2 — feature showcase ──────────────────────────────────────────

const nav2 = init({
  keyPrefix: 'demo2',
  defaults: {
    mode: 'dir',
    globalShortcut: 'Ctrl+Shift+K',
    modeSwapShortcut: 'Ctrl+Shift+M',
    theme: 'system',
  },
  tree: {

    // ── Actions ─────────────────────────────────────────────────────────────
    actions: {
      type: 'directory',
      label: 'Actions',
      children: {
        simple: {
          type: 'action',
          label: 'Simple Action',
          action: () => log('[2] Action fired'),
        },
        counted: {
          type: 'action',
          label: 'Counted Action (click multiple times)',
          action: (() => {
            let n = 0;
            return () => log(`[2] Count: ${++n}`);
          })(),
        },
      },
    },

    // ── Text inputs (text + textarea together — both are inline edit) ────────
    'text-inputs': {
      type: 'directory',
      label: 'Text Inputs',
      children: {
        'single-line': {
          type: 'input',
          label: 'Single Line',
          inputType: 'text',
          defaultValue: 'hello',
          onChange: (v) => log(`[2] single-line: "${v}"`),
        },
        'multi-line': {
          type: 'input',
          label: 'Multi Line',
          inputType: 'textarea',
          defaultValue: 'line one\nline two',
          onChange: (v) => log(`[2] multi-line saved (${String(v).length} chars)`),
        },
      },
    },

    // ── Checkbox (immediate toggle, no modal) ────────────────────────────────
    toggles: {
      type: 'directory',
      label: 'Toggles (Checkbox)',
      children: {
        'feature-flag': {
          type: 'input',
          label: 'Feature Flag',
          inputType: 'checkbox',
          defaultValue: false,
          onChange: (v) => log(`[2] feature-flag: ${v}`),
        },
        'verbose-mode': {
          type: 'input',
          label: 'Verbose Mode',
          inputType: 'checkbox',
          defaultValue: true,
          onChange: (v) => log(`[2] verbose: ${v}`),
        },
      },
    },

    // ── Selections — input/select, input/select-multiple, and type:select ────
    selections: {
      type: 'directory',
      label: 'Selections',
      children: {
        'input-select': {
          type: 'input',
          label: 'Input Select (persisted)',
          inputType: 'select',
          options: ['Red', 'Green', 'Blue', 'Yellow'],
          defaultValue: 'Blue',
          onChange: (v) => log(`[2] color: ${v}`),
        },
        'input-multiselect': {
          type: 'input',
          label: 'Input Multi-Select (persisted)',
          inputType: 'select-multiple',
          options: ['TypeScript', 'SolidJS', 'Vite', 'TailwindCSS', 'Vitest'],
          onChange: (v) => log(`[2] stack: ${(v as string[]).join(', ')}`),
        },
        'select-static': {
          type: 'select',
          label: 'Select (static, not persisted)',
          options: ['Option A', 'Option B', 'Option C'],
          onSelect: (v) => log(`[2] picked: ${v}`),
        },
        'select-async': {
          type: 'select',
          label: 'Select (async load)',
          load: () => new Promise<string[]>((resolve) => {
            log('[2] loading options…');
            setTimeout(() => resolve(['Alice', 'Bob', 'Carol', 'Dave', 'Eve']), 800);
          }),
          onSelect: (v) => log(`[2] assigned: ${v}`),
        },
      },
    },

    // ── Directory types — static vs lazy (loads once, cached) ───────────────
    directories: {
      type: 'directory',
      label: 'Directories',
      children: {
        static: {
          type: 'directory',
          label: 'Static Directory',
          children: {
            a: { type: 'action', label: 'Child A', action: () => log('[2] Child A') },
            b: { type: 'action', label: 'Child B', action: () => log('[2] Child B') },
            c: { type: 'action', label: 'Child C', action: () => log('[2] Child C') },
          },
        },
        lazy: {
          type: 'directory',
          label: 'Lazy Directory (loads once)',
          load: () => new Promise((resolve) => {
            log('[2] lazy dir loading…');
            setTimeout(() => {
              log('[2] lazy dir loaded and cached');
              resolve({
                x: { type: 'action', label: 'Loaded X', action: () => log('[2] Loaded X') },
                y: { type: 'action', label: 'Loaded Y', action: () => log('[2] Loaded Y') },
                z: { type: 'action', label: 'Loaded Z', action: () => log('[2] Loaded Z') },
              });
            }, 1200);
          }),
        },
      },
    },

    // ── Pagination — 15 items → 2 pages ─────────────────────────────────────
    pagination: {
      type: 'directory',
      label: 'Pagination (15 items, 2 pages)',
      children: Object.fromEntries(
        Array.from({ length: 15 }, (_, i) => [
          `item-${i + 1}`,
          { type: 'action' as const, label: `Item ${i + 1}`, action: () => log(`[2] Item ${i + 1}`) },
        ])
      ),
    },

    // ── Combinations — features that interact ────────────────────────────────
    combinations: {
      type: 'directory',
      label: 'Combinations',
      children: {
        // Lazy dir that resolves to 12 items → tests lazy + pagination together
        'lazy-paginated': {
          type: 'directory',
          label: 'Lazy + Pagination (12 items on load)',
          load: () => new Promise((resolve) => {
            log('[2] lazy+paginated loading…');
            setTimeout(() => {
              log('[2] loaded 12 items — should paginate');
              resolve(Object.fromEntries(
                Array.from({ length: 12 }, (_, i) => [
                  `loaded-${i + 1}`,
                  { type: 'action' as const, label: `Loaded ${i + 1}`, action: () => log(`[2] Loaded ${i + 1}`) },
                ])
              ));
            }, 1000);
          }),
        },
        // 3 levels deep → tests breadcrumb nav and back navigation
        nested: {
          type: 'directory',
          label: 'Nested (3 levels deep)',
          children: {
            level2: {
              type: 'directory',
              label: 'Level 2',
              children: {
                level3: {
                  type: 'directory',
                  label: 'Level 3',
                  children: {
                    leaf: { type: 'action', label: 'Deep Leaf', action: () => log('[2] reached the bottom') },
                  },
                },
              },
            },
          },
        },
        // All input types mixed in one directory
        mixed: {
          type: 'directory',
          label: 'Mixed Types',
          children: {
            act: { type: 'action', label: 'Action', action: () => log('[2] mixed action') },
            txt: { type: 'input', label: 'Text Input', inputType: 'text', onChange: (v) => log(`[2] mixed text: ${v}`) },
            chk: { type: 'input', label: 'Checkbox', inputType: 'checkbox', defaultValue: false, onChange: (v) => log(`[2] mixed checkbox: ${v}`) },
            sel: { type: 'select', label: 'Select', options: ['X', 'Y', 'Z'], onSelect: (v) => log(`[2] mixed select: ${v}`) },
            dir: {
              type: 'directory',
              label: 'Sub Directory',
              children: {
                child: { type: 'action', label: 'Sub Child', action: () => log('[2] mixed sub-child') },
              },
            },
          },
        },
      },
    },

  },
});

// Debug toggle
document.getElementById('btn-debug')?.addEventListener('change', (e) => {
  setDebugMode((e.target as HTMLInputElement).checked);
});

// Expose instances for console debugging (window.nav / window.nav2)
(window as unknown as Record<string, unknown>)['nav'] = nav;
(window as unknown as Record<string, unknown>)['nav2'] = nav2;

// Wire manual buttons
document.getElementById('btn-show')?.addEventListener('click', () => nav.show());
document.getElementById('btn-hide')?.addEventListener('click', () => nav.hide());
document.getElementById('btn-show2')?.addEventListener('click', () => nav2.show());

// Auto-show instance 1 on load after a tick
setTimeout(() => {
  nav.show();
  log('Ready — use buttons or Ctrl+` to toggle');
}, 100);
