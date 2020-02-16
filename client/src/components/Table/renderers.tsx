import moment from 'moment';
import { CheckCircleFilled, MinusCircleOutlined } from '@ant-design/icons';
import { Tag } from 'antd';

export function dateRenderer(value: string | null) {
  return value ? moment(value).format('YYYY-MM-DD') : '';
}

export function timeRenderer(value: string) {
  return value ? moment(value, 'HH:mm:ssZ').format('HH:mm') : '';
}

export function dateTimeRenderer(value: string) {
  return value ? moment(value).format('YYYY-MM-DD HH:mm') : '';
}

export function boolRenderer(value: string) {
  return value != null ? value.toString() : '';
}

export function boolIconRenderer(value: any) {
  return value ? (
    <CheckCircleFilled title={(!!value).toString()} />
  ) : (
    <MinusCircleOutlined title={(!!value).toString()} />
  );
}

export function tagsRenderer(values: (number | string)[]) {
  if (!Array.isArray(values)) {
    return '';
  }
  return <span>{values.map(renderTag)}</span>;
}

function renderTag(value: number | string) {
  return <Tag key={value}>{value}</Tag>;
}

export function stringTrimRenderer(value: string) {
  return value && value.length > 20 ? `${value.slice(0, 20)}...` : value;
}

export const idFromArrayRenderer = <T extends { id: number; name: string }>(data: T[]) => (value: number) => {
  const item = data.find(d => d.id === value);
  return item ? item.name : '(Empty)';
};
