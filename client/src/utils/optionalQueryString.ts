export function optionalQueryString(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return String(value[0]).trim();
  } else if (typeof value === 'string') {
    return String(value).trim();
  }
}
