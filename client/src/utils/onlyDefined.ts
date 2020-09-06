import { pickBy } from 'lodash';

export function onlyDefined<T extends Record<string, any>>(data: T) {
  return pickBy<T>(data, val => val !== undefined && val !== '' && val !== null)
}
