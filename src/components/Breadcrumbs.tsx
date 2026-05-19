import { For, Show } from 'solid-js';

interface BreadcrumbsProps {
  pathLabels: string[];
  onNavigateTo: (index: number) => void;
}

export default function Breadcrumbs(props: BreadcrumbsProps) {
  const segments = () => {
    const labels = ['🏠', ...props.pathLabels];
    if (labels.length > 3) {
      return [
        { label: '🏠', index: -1 },
        { label: '…', index: -2 },
        { label: labels[labels.length - 2], index: props.pathLabels.length - 2 },
        { label: labels[labels.length - 1], index: props.pathLabels.length - 1 },
      ];
    }
    return labels.map((label, i) => ({ label, index: i - 1 }));
  };

  return (
    <nav
      class="breadcrumbs"
      aria-label="Directory path"
      style={{
        display: 'flex',
        'align-items': 'center',
        gap: '2px',
        padding: '4px 8px',
        'font-size': '11px',
        color: 'var(--rove-text-dim)',
        'border-bottom': '1px solid var(--rove-border)',
        'flex-wrap': 'wrap',
      }}
    >
      <For each={segments()}>
        {(seg, i) => (
          <>
            <Show when={i() > 0}>
              <span style={{ color: 'var(--rove-text-dim)' }}>/</span>
            </Show>
            <Show
              when={seg.index !== -2}
              fallback={<span style={{ color: 'var(--rove-text-dim)' }}>…</span>}
            >
              <button
                onClick={() => props.onNavigateTo(seg.index)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--rove-accent)',
                  'font-size': 'inherit',
                  padding: '0 2px',
                  'text-decoration': 'underline',
                }}
              >
                {seg.label}
              </button>
            </Show>
          </>
        )}
      </For>
    </nav>
  );
}
