export function optionalQueryString(value: string[] | undefined) {
  if (Array.isArray(value)) {
    return String(value[0]).trim();
  }
}
