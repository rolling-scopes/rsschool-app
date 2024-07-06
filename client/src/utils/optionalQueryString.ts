export function optionalQueryString(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    const trimmedElements = value.map(elem => elem.trim()).join(',');
    if (trimmedElements !== '') {
      return trimmedElements;
    }
  } else if (typeof value === 'string') {
    return String(value).trim();
  }
}
