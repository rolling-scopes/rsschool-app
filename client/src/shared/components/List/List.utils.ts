export function getKey<T>(item: T, index: number, rowKey?: string | ((item: T) => string)): string {
  if (!rowKey) return String(index);
  if (typeof rowKey === 'function') return rowKey(item);
  return String((item as Record<string, unknown>)[rowKey]);
}
