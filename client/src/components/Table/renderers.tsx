import moment from 'moment-timezone';
import {
  CheckCircleFilled,
  MinusCircleOutlined,
  YoutubeOutlined,
  ChromeOutlined,
  GithubOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { Tag, Tooltip, Typography } from 'antd';
import { getTagStyle } from '../Schedule/UserSettings/userSettingsHandlers';

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

export function renderTagWithStyle(tagName: string, storedTagColors?: object) {
  return (
    <Tag style={getTagStyle(tagName, storedTagColors)} key={tagName}>
      {tagName}
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

export const placeRenderer = (value: string) => {
  return value === 'Youtube Live' ? (
    <div>
      <YoutubeOutlined /> {value}{' '}
      <Tooltip title="Ссылка будет в Discord">
        <QuestionCircleOutlined />
      </Tooltip>
    </div>
  ) : (
    <Tooltip title={value}>{<div style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>{value}</div>}</Tooltip>
  );
};

export const scoreRenderer = (score: string) => {
  if (!score) {
    return;
  }

  const [num, total] = score.split('/');

  if (!num || !total) {
    return;
  }

  const done = ((+num / +total) * 100).toFixed();

  return (
    <Tooltip placement="topLeft" title={`Done: ${done} %.`}>
      <Text strong>{score}</Text>
    </Tooltip>
  );
};
