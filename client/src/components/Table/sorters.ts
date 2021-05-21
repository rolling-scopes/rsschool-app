import { get } from 'lodash';

type SortOrder = 'descend' | 'ascend' | null;

export function stringSorter<T>(field: keyof T) {
  return (a: T, b: T, order?: SortOrder) => {
    const valueOne = get(a, field, '');
    const valueTwo = get(b, field, '');

    if (valueOne == valueTwo || (a == null && b == null) || (valueOne == null && valueTwo == null)) {
      return 0;
    }
    if (a == null || valueOne == null) {
      return order === 'ascend' ? 1 : -1;
    } else if (b == null || valueTwo == null) {
      return order === 'ascend' ? -1 : 1;
    }
    return valueOne.toString().toLowerCase().localeCompare(valueTwo.toString().toLowerCase());
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
    return Number(bValue) - Number(aValue);
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
