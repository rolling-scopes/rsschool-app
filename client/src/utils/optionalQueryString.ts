export function optionalQueryString(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.join(',').trim();
  } else if (typeof value === 'string') {
    return String(value).trim();
  }
}
