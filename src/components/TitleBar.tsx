interface TitleBarProps {
  title: string;
  canGoBack: boolean;
  onBack: () => void;
  onModeSwap: () => void;
  onClose: () => void;
  onReset: () => void;
  onDragStart: (e: MouseEvent) => void;
}

export default function TitleBar(props: TitleBarProps) {
  return (
    <div
      class="titlebar"
      role="toolbar"
      onMouseDown={props.onDragStart}
      style={{
        display: 'flex',
        'align-items': 'center',
        padding: '6px 8px',
        background: 'var(--rove-surface)',
        'border-bottom': '1px solid var(--rove-border)',
        cursor: 'move',
        'user-select': 'none',
        gap: '6px',
      }}
    >
      <button
        class="titlebar-btn"
        aria-label="Go back"
        disabled={!props.canGoBack}
        onClick={(e) => { e.stopPropagation(); props.onBack(); }}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          background: 'none',
          border: 'none',
          cursor: props.canGoBack ? 'pointer' : 'default',
          color: props.canGoBack ? 'var(--rove-text)' : 'var(--rove-text-dim)',
          'font-size': '14px',
          padding: '2px 6px',
        }}
      >
        ←
      </button>

      <span
        class="titlebar-title"
        style={{
          flex: 1,
          'text-align': 'center',
          overflow: 'hidden',
          'text-overflow': 'ellipsis',
          'white-space': 'nowrap',
          'font-weight': '500',
          'font-size': '13px',
          color: 'var(--rove-text)',
        }}
      >
        {props.title}
      </span>

      <button
        class="titlebar-btn"
        aria-label="Switch to palette view"
        title="Switch to palette view"
        onClick={(e) => { e.stopPropagation(); props.onModeSwap(); }}
        onMouseDown={(e) => e.stopPropagation()}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rove-text-dim)', 'font-size': '14px', padding: '2px 6px' }}
      >
        ⌕
      </button>

      <button
        class="titlebar-btn"
        aria-label="Reset window position"
        title="Reset position"
        onClick={(e) => { e.stopPropagation(); props.onReset(); }}
        onMouseDown={(e) => e.stopPropagation()}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rove-text-dim)', 'font-size': '12px', padding: '2px 6px' }}
      >
        □
      </button>

      <button
        class="titlebar-btn"
        aria-label="Close"
        onClick={(e) => { e.stopPropagation(); props.onClose(); }}
        onMouseDown={(e) => e.stopPropagation()}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rove-text-dim)', 'font-size': '16px', padding: '2px 6px' }}
      >
        ×
      </button>
    </div>
  );
}
