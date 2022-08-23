import {
  CheckCircleFilled,
  ChromeOutlined,
  GithubOutlined,
  MinusCircleOutlined,
  YoutubeOutlined,
} from '@ant-design/icons';
import { Tag, Tooltip, Typography } from 'antd';
import { CourseScheduleItemDto, CreateCourseTaskDtoCheckerEnum } from 'api';
import moment from 'moment-timezone';
import { CrossCheckStatus } from 'services/course';

const { Text } = Typography;

export function dateRenderer(value: string | null) {
  return value ? moment(value).format('YYYY-MM-DD') : '';
}

export function crossCheckDateRenderer(value: string | null, { checker }: { checker: CreateCourseTaskDtoCheckerEnum }) {
  if (checker !== 'crossCheck') return 'N/A';
  return value ? moment(value).tz('UTC').format('YYYY-MM-DD') : 'Not Set';
}

export function crossCheckStatusRenderer(
  value: CrossCheckStatus,
  { checker }: { checker: CreateCourseTaskDtoCheckerEnum },
) {
  return checker !== 'crossCheck' ? (
    'N/A'
  ) : value === CrossCheckStatus.Initial ? (
    'Not distributed'
  ) : (
    <span style={{ textTransform: 'capitalize' }}>{value}</span>
  );
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

export function buildCheckBoxRenderer<T>(
  dataIndex: string[],
  onChange: (id: string[], record: T, checked: boolean) => void,
  undefinedAsTrue?: boolean,
) {
  return function (value: boolean, record: T) {
    const defaultValue = value ?? false;
    return (
      <input
        type="checkbox"
        checked={undefinedAsTrue ? value === undefined || defaultValue : defaultValue}
        onChange={event => onChange(dataIndex, record, event.target.checked)}
      />
    );
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

export const weightRenderer = (weight: number | null) => {
  if (weight === null) return null;

  return <Text>×{+weight.toFixed(2)}</Text>;
};

export const scoreRenderer = (item: CourseScheduleItemDto) => {
  const { maxScore, score } = item;
  if (maxScore == null) return null;

  return (
    <Text>
      {score ?? 0} / {maxScore}
    </Text>
  );
};
