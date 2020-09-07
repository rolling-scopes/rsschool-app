import { pickBy } from 'lodash';

export const onlyDefined = (data: object) => pickBy(data, val => val !== undefined && val !== '' && val !== null);
