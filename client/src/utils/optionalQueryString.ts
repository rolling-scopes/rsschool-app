export function optionalQueryString(value: string | string[] | undefined) {
  return value ? String(value) : undefined;
}
