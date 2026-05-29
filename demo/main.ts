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
  },
});

// ─── Instance 2 — minimal, isolated ─────────────────────────────────────────

const nav2 = init({
  keyPrefix: 'demo2',
  defaults: {
    mode: 'palette',
    globalShortcut: 'Ctrl+Shift+K',
    modeSwapShortcut: 'Ctrl+Shift+M',
    theme: 'system',
  },
  tree: {
    ping: {
      type: 'action',
      label: 'Ping (Instance 2)',
      action: () => log('[Instance 2] Pong!'),
    },
    message: {
      type: 'input',
      label: 'Send Message (Instance 2)',
      inputType: 'text',
      onChange: (v) => log(`[Instance 2] Message: "${v}"`),
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
