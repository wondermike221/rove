import { For, Show } from 'solid-js';
import type { SearchResult } from '../types';

interface PaletteResultProps {
  result: SearchResult;
  selected: boolean;
  onActivate: () => void;
}

interface HighlightSegment {
  text: string;
  highlighted: boolean;
}

function buildSegments(label: string, ranges: [number, number][]): HighlightSegment[] {
  const segments: HighlightSegment[] = [];
  let cursor = 0;

  for (const [start, end] of ranges) {
    if (start > cursor) {
      segments.push({ text: label.slice(cursor, start), highlighted: false });
    }
    segments.push({ text: label.slice(start, end), highlighted: true });
    cursor = end;
  }
  if (cursor < label.length) {
    segments.push({ text: label.slice(cursor), highlighted: false });
  }
  return segments;
}

export default function PaletteResult(props: PaletteResultProps) {
  const item = () => props.result.item;
  const label = () => ('label' in item() ? (item() as { label: string }).label : '');
  const pathLabel = () =>
    props.result.pathLabels.length > 0 ? props.result.pathLabels.join(' › ') : null;

  const segments = () =>
    props.result.ranges.length > 0
      ? buildSegments(label(), props.result.ranges)
      : [{ text: label(), highlighted: false }];

  return (
    <div
      class={`palette-result${props.selected ? ' palette-result--selected' : ''}`}
      role="option"
      aria-selected={props.selected}
      onClick={props.onActivate}
      style={{
        padding: '8px 14px',
        cursor: 'pointer',
        background: props.selected ? 'var(--rove-selected)' : 'transparent',
      }}
    >
      <Show when={pathLabel()}>
        <div
          class="result-path"
          style={{ 'font-size': '11px', color: 'var(--rove-text-dim)', 'margin-bottom': '2px' }}
        >
          {pathLabel()}
        </div>
      </Show>
      <span class="result-label">
        <For each={segments()}>
          {(seg) =>
            seg.highlighted ? (
              <mark
                class="result-highlight"
                style={{ background: 'var(--rove-accent)', color: 'var(--rove-bg)', 'border-radius': '2px', padding: '0 1px' }}
              >
                {seg.text}
              </mark>
            ) : (
              <span>{seg.text}</span>
            )
          }
        </For>
      </span>
    </div>
  );
}
