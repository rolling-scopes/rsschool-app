export function optionalQueryString(value: string | undefined) {
  return value ? String(value) : undefined;
}
