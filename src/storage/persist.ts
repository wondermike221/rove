export function read<T>(prefix: string, category: string, key: string): T | null {
  try {
    const raw = localStorage.getItem(`${prefix}.${category}.${key}`);
    return raw !== null ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function write(prefix: string, category: string, key: string, value: unknown): void {
  try {
    localStorage.setItem(`${prefix}.${category}.${key}`, JSON.stringify(value));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

export function clear(prefix: string): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(`${prefix}.`)) keysToRemove.push(k);
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // localStorage unavailable — silently ignore
  }
}
