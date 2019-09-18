import moment from 'moment';

export function dateRenderer(value: string) {
  return value ? moment(value).format('YYYY-MM-DD') : '';
}

export function timeRenderer(value: string) {
  return value ? moment(value, 'HH:mm:ssZ').format('HH:mm') : '';
}

export function boolRenderer(value: string) {
  return value != null ? value.toString() : '';
}

export function stringTrimRenderer(value: string) {
  return value && value.length > 20 ? `${value.slice(0, 20)}...` : value;
}

export const idFromArrayRenderer = <T extends { id: number; name: string }>(data: T[]) => (value: number) => {
  const item = data.find(d => d.id === value);
  return item ? item.name : '(Empty)';
};
