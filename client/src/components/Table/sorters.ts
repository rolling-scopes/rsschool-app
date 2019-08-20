import get from 'lodash.get';

export function stringSorter<T>(field: keyof T) {
  return (a: T, b: T) => {
    if (a == null && b == null) {
      return 0;
    }
    if (a == null) {
      return -1;
    }
    if (b == null) {
      return 1;
    }
    return get(a, field)
      .toString()
      .localeCompare(get(b, field).toString());
  };
}

export function numberSorter<T>(field: keyof T) {
  return (a: T, b: T) => {
    if (a == null && b == null) {
      return 0;
    }
    if (a == null) {
      return 1;
    }
    if (b == null) {
      return -1;
    }
    const aValue = get(a, field);
    const bValue = get(b, field);
    return bValue - aValue;
  };
}
