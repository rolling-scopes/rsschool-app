export function optionalQueryString(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.map(elem => elem.trim());
  } else if (typeof value === 'string') {
    return String(value).trim();
  }
}
