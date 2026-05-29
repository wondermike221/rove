import uFuzzy from '@leeoniya/ufuzzy';
import type { DirectoryNode, DirectoryItem, SearchIndex, SearchResult } from '../types';

const uf = new uFuzzy({ intraMode: 1 });

function traverseNode(
  node: DirectoryNode,
  path: string[],
  pathLabels: string[],
  haystack: string[],
  items: SearchResult[],
): void {
  for (const [key, item] of Object.entries(node)) {
    if (item.type === 'directory' && item.children && !item.load) {
      // Static directory: traverse children, don't add the dir itself to index
      traverseNode(
        item.children,
        [...path, key],
        [...pathLabels, item.label],
        haystack,
        items,
      );
    } else if (item.type === 'directory' && item.load && item.children) {
      // Lazy directory already loaded: traverse children like a static dir
      traverseNode(
        item.children,
        [...path, key],
        [...pathLabels, item.label],
        haystack,
        items,
      );
    } else {
      // Leaf items: action, input, select, and unloaded lazy directory.
      // Unloaded lazy dirs appear in the index so users can find and trigger them.
      const label = 'label' in item ? item.label : key;
      const contextStr = pathLabels.length > 0 ? `${pathLabels.join(' > ')} > ${label}` : label;
      haystack.push(contextStr);
      items.push({
        item,
        key,
        path: [...path, key],
        pathLabels: [...pathLabels],
        score: 0,
        ranges: [],
      });
    }
  }
}

export function buildIndex(tree: DirectoryNode): SearchIndex {
  const haystack: string[] = [];
  const items: SearchResult[] = [];
  traverseNode(tree, [], [], haystack, items);
  return { haystack, items };
}

export function search(index: SearchIndex, query: string): SearchResult[] {
  if (!query.trim()) return [];

  const [idxs, info, order] = uf.search(index.haystack, query);
  if (!idxs || !info || !order) return [];

  return order.map((pos) => {
    const idx = idxs[pos];
    const result = index.items[idx];

    const rawRanges = info.ranges[pos] as number[];
    const parsedRanges: [number, number][] = [];
    for (let i = 0; i < rawRanges.length; i += 2) {
      parsedRanges.push([rawRanges[i], rawRanges[i + 1]]);
    }

    return {
      ...result,
      score: info.idx[pos],
      ranges: parsedRanges,
    };
  });
}

export function appendToIndex(
  index: SearchIndex,
  subtree: DirectoryNode,
  pathPrefix: string[],
  pathLabelPrefix: string[],
): SearchIndex {
  const newHaystack = [...index.haystack];
  const newItems = [...index.items];
  traverseNode(subtree, pathPrefix, pathLabelPrefix, newHaystack, newItems);
  return { haystack: newHaystack, items: newItems };
}
