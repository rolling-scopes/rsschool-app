export function optionalQueryString(value: string | string[] | undefined) {
  if (!value) {
    return undefined;
  } else if (Array.isArray(value)) {
    return String(value[0]);
  }

  return String(value);
}
