import { get } from 'lodash';

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
    return get(a, field, '')
      .toString()
      .toLowerCase()
      .localeCompare(
        get(b, field, '')
          .toString()
          .toLowerCase(),
      );
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
    const aValue = get(a, field, 0);
    const bValue = get(b, field, 0);
    return bValue - aValue;
  };
}

export function boolSorter<T>(field: keyof T) {
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
    const aValue = !!get(a, field, 0);
    const bValue = !!get(b, field, 0);
    return Number(bValue) - Number(aValue);
  };
}

export function dateSorter<T>(field: keyof T) {
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
    const aValue = get(a, field, 0);
    const bValue = get(b, field, 0);
    return new Date(bValue).getTime() - new Date(aValue).getTime();
  };
}
