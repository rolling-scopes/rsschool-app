import { ChangeEvent } from 'react';
import moment from 'moment-timezone';
import {
  CheckCircleFilled,
  MinusCircleOutlined,
  YoutubeOutlined,
  ChromeOutlined,
  GithubOutlined,
} from '@ant-design/icons';
import { Tag, Tooltip, Typography } from 'antd';
import { getTagStyle } from 'components/Schedule';
import { BaseType } from 'antd/lib/typography/Base';
import { ScheduleEvent } from 'components/Schedule/model';

const { Text } = Typography;

export function dateRenderer(value: string | null) {
  return value ? moment(value).format('YYYY-MM-DD') : '';
}

export function timeRenderer(value: string) {
  return value ? moment(value, 'HH:mm:ssZ').format('HH:mm') : '';
}

export function dateTimeRenderer(value: string | null) {
  return value ? moment(value).format('YYYY-MM-DD HH:mm') : '';
}

export function shortDateTimeRenderer(value: string) {
  return value ? moment(value).format('DD.MM HH:mm') : '';
}

export const dateWithTimeZoneRenderer = (timeZone: string, format: string) => (value: string) =>
  value ? moment(value, 'YYYY-MM-DD HH:mmZ').tz(timeZone).format(format) : '';

export const coloredDateRenderer =
  (timeZone: string, format: string, date: 'start' | 'end') =>
  (value: string, { startDate, endDate, score }: ScheduleEvent) => {
    let color: BaseType | undefined = undefined;
    const now = moment();
    const start = moment(startDate);
    const end = moment(endDate);

    const isDeadlineSoon = now <= end && moment(end).subtract(48, 'hours') <= now && !score?.total;
    const isCurrent = now >= start && now < end && !score?.total;
    const isDeadlineMissed = now >= end && moment(end).add(24, 'hours') >= now && !score?.total;
    const isPast = now > end || score?.total;

    if (isDeadlineSoon && date === 'end') color = 'warning';
    else if (isCurrent && date === 'start') color = 'success';
    else if (isDeadlineMissed && date === 'end') color = 'danger';
    else if (isPast) color = 'secondary';

    return <Text type={color}>{dateWithTimeZoneRenderer(timeZone, format)(value)}</Text>;
  };

export function boolRenderer(value: string) {
  return value != null ? value.toString() : '';
}

export function buildCheckBoxRenderer<T>(
  dataIndex: string[],
  onChange: (id: string[], record: T, event: ChangeEvent<HTMLInputElement>) => void,
) {
  return function (value: boolean = false, record: T) {
    return <input type="checkbox" checked={value} onChange={event => onChange(dataIndex, record, event)} />;
  };
}

export function boolIconRenderer(value: any) {
  return value ? (
    <CheckCircleFilled title={(!!value).toString()} />
  ) : (
    <MinusCircleOutlined title={(!!value).toString()} />
  );
}

export function colorTagRenderer(value: number | string, color?: string) {
  return <span key={value}>{renderTag(value, color)}</span>;
}

export function tagsRenderer(values: (number | string)[]) {
  if (!Array.isArray(values)) {
    return '';
  }
  return <span>{values.map(v => renderTag(v))}</span>;
}

export function renderTag(value: number | string, color?: string) {
  return (
    <Tag color={color} key={value}>
      {value}
    </Tag>
  );
}

export function renderTagWithStyle(
  tagName: string,
  tagColors?: Record<string, string>,
  tagMap?: Record<string, string>,
) {
  return (
    <Tag style={getTagStyle(tagName, tagColors)} key={tagName}>
      {tagMap?.[tagName] || tagName}
    </Tag>
  );
}

export function stringTrimRenderer(value: string) {
  return value && value.length > 20 ? `${value.slice(0, 20)}...` : value;
}

export const idFromArrayRenderer =
  <T extends { id: number; name: string }>(data: T[]) =>
  (value: number) => {
    const item = data.find(d => d.id === value);
    return item ? item.name : '(Empty)';
  };

const getUrlIcon = (url: string) => {
  const lowerUrl = url.toLowerCase();
  const isGithubLink = lowerUrl.includes('github');
  const isYoutubeLink = lowerUrl.includes('youtube');
  const isYoutubeLink2 = lowerUrl.includes('youtu.be');

  if (isGithubLink) {
    return <GithubOutlined />;
  }

  if (isYoutubeLink || isYoutubeLink2) {
    return <YoutubeOutlined />;
  }

  return <ChromeOutlined />;
};

export const urlRenderer = (url: string) =>
  !!url && (
    <Tooltip placement="topLeft" title={url}>
      <a target="_blank" href={url}>
        {getUrlIcon(url)}
      </a>
    </Tooltip>
  );

export const scoreRenderer = (score: { total: number; max: number; donePercent: number } | null) => {
  if (!score) return null;

  const { total, max, donePercent } = score;

  return (
    <Tooltip placement="topLeft" title={`Done: ${donePercent}%`}>
      <Text strong>
        {total}/{max}
      </Text>
    </Tooltip>
  );
};
