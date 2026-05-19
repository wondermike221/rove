import { createSignal, onCleanup, onMount, Show, Switch, Match } from 'solid-js';
import type { InputItem, OverlayState } from '../types';

interface ModalSheetProps {
  overlay: OverlayState;
  keyPrefix: string;
  onAccept: (value: string | boolean | string[]) => void;
  onCancel: () => void;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => !el.hasAttribute('disabled'));
}

export default function ModalSheet(props: ModalSheetProps) {
  let containerRef: HTMLDivElement | undefined;
  let triggerElement: Element | null = null;

  onMount(() => {
    triggerElement = document.activeElement;
    const focusable = getFocusableElements(containerRef!);
    if (focusable[0]) focusable[0].focus();
  });

  onCleanup(() => {
    if (triggerElement instanceof HTMLElement) triggerElement.focus();
  });

  function trapFocus(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;
    const focusable = getFocusableElements(containerRef!);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = containerRef!.ownerDocument?.activeElement;

    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    trapFocus(e);
    if (e.key === 'Escape') {
      e.preventDefault();
      props.onCancel();
    }
  }

  return (
    <div
      class="modal-backdrop"
      style={{
        position: 'fixed',
        inset: '0',
        background: 'rgba(0,0,0,0.45)',
        'z-index': '1000000',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
      }}
      onClick={props.onCancel}
    >
    <div
      class="modal-sheet"
      role="dialog"
      aria-modal="true"
      ref={containerRef}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
      style={{
        background: 'var(--rove-bg)',
        border: '1px solid var(--rove-border)',
        'border-radius': 'var(--rove-border-radius)',
        'box-shadow': 'var(--rove-shadow)',
        width: '90%',
        'max-width': '460px',
        padding: '20px 24px',
        'max-height': '80vh',
        'overflow-y': 'auto',
      }}
    >
      <Switch>
        <Match when={props.overlay.type === 'input'}>
          <InputForm
            item={(props.overlay as { type: 'input'; item: InputItem; nodeKey: string; nodePath: string[] }).item}
            onAccept={props.onAccept}
            onCancel={props.onCancel}
          />
        </Match>
        <Match when={props.overlay.type === 'loading'}>
          <div class="modal-loading">
            <span>Loading…</span>
            <button onClick={props.onCancel}>Dismiss</button>
          </div>
        </Match>
        <Match when={props.overlay.type === 'error'}>
          <div class="modal-error">
            <p>{(props.overlay as { type: 'error'; message: string }).message}</p>
            <button onClick={props.onCancel}>Close</button>
          </div>
        </Match>
      </Switch>
    </div>
    </div>
  );
}

interface InputFormProps {
  item: InputItem;
  onAccept: (value: string | boolean | string[]) => void;
  onCancel: () => void;
}

function InputForm(props: InputFormProps) {
  const defaultVal = () => {
    const dv = props.item.defaultValue;
    if (dv !== undefined) return dv;
    if (props.item.inputType === 'checkbox') return false;
    if (props.item.inputType === 'select-multiple') return [] as string[];
    return '';
  };

  const [value, setValue] = createSignal<string | boolean | string[]>(defaultVal());

  const it = props.item.inputType;

  return (
    <div class="modal-input">
      <label class="modal-label">{props.item.label}</label>

      <Show when={it === 'text'}>
        <input
          type="text"
          class="modal-input-field"
          value={value() as string}
          onInput={(e) => setValue(e.currentTarget.value)}
          onFocus={(e) => {
            const len = e.currentTarget.value.length;
            e.currentTarget.setSelectionRange(len, len);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              props.onAccept(value());
            } else if (e.key === 'Escape') {
              e.preventDefault();
              props.onCancel();
            }
          }}
        />
      </Show>

      <Show when={it === 'textarea'}>
        <textarea
          class="modal-input-field modal-textarea"
          onInput={(e) => setValue(e.currentTarget.value)}
          onFocus={(e) => {
            const len = e.currentTarget.value.length;
            e.currentTarget.setSelectionRange(len, len);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              props.onAccept(value());
            } else if (e.key === 'Escape') {
              e.preventDefault();
              props.onCancel();
            }
          }}
        >
          {value() as string}
        </textarea>
      </Show>

      <Show when={it === 'checkbox'}>
        <input
          type="checkbox"
          class="modal-input-checkbox"
          checked={value() as boolean}
          onChange={(e) => setValue(e.currentTarget.checked)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              props.onAccept(value());
            }
          }}
        />
      </Show>

      <Show when={it === 'select'}>
        <select
          class="modal-input-field"
          value={value() as string}
          onChange={(e) => setValue(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              props.onAccept(value());
            }
          }}
        >
          {props.item.options?.map((opt) => (
            <option value={opt}>{opt}</option>
          ))}
        </select>
      </Show>

      <Show when={it === 'select-multiple'}>
        <select
          multiple
          class="modal-input-field"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              props.onAccept(value());
            }
          }}
          onChange={(e) => {
            const selected = Array.from(e.currentTarget.selectedOptions).map((o) => o.value);
            setValue(selected);
          }}
        >
          {props.item.options?.map((opt) => (
            <option value={opt}>{opt}</option>
          ))}
        </select>
      </Show>

      <div class="modal-actions">
        <button class="modal-btn modal-btn--primary" onClick={() => props.onAccept(value())}>
          Accept <kbd>Ctrl+Enter</kbd>
        </button>
        <button class="modal-btn" onClick={props.onCancel}>
          Cancel <kbd>Esc</kbd>
        </button>
      </div>
    </div>
  );
}
