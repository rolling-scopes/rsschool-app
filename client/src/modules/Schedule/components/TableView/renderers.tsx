import { InfoCircleOutlined } from '@ant-design/icons';
import { Badge, Tag, Tooltip, Typography } from 'antd';
import { BaseType } from 'antd/lib/typography/Base';
import { CourseScheduleItemDto, CourseScheduleItemDtoStatusEnum, CourseScheduleItemDtoTagEnum } from 'api';
import { dateWithTimeZoneRenderer } from 'components/Table/renderers';
import capitalize from 'lodash/capitalize';
import { TAG_NAME_MAP } from 'modules/Schedule/constants';
import { getTagStyle } from 'modules/Schedule/utils';
import moment from 'moment-timezone';

export function statusRenderer(value: CourseScheduleItemDtoStatusEnum) {
  const label = capitalize(value);
  switch (value) {
    case CourseScheduleItemDtoStatusEnum.Done:
      return <Badge status="success" text={label} />;
    case CourseScheduleItemDtoStatusEnum.Missed:
      return <Badge status="error" text={label} />;
    case CourseScheduleItemDtoStatusEnum.Archived:
      return <Badge status="default" text={label} />;
    case CourseScheduleItemDtoStatusEnum.Available:
      return <Badge status="processing" text={label} />;
    case CourseScheduleItemDtoStatusEnum.Future:
      return <Badge color="cyan" text={label} />;
    case CourseScheduleItemDtoStatusEnum.Review:
      return <Badge color="purple" text={label} />;
    default:
      return <Badge status="default" text={label} />;
  }
}

export function renderTagWithStyle(tagName: CourseScheduleItemDto['tag'], tagColors: Record<string, string>) {
  return (
    <Tag style={getTagStyle(tagName, tagColors)} key={tagName}>
      {TAG_NAME_MAP[tagName] || tagName}
    </Tag>
  );
}

export const coloredDateRenderer = (timeZone: string, format: string, date: 'start' | 'end', infoText: string) => {
  const now = moment();
  return (value: string, { startDate, endDate, score, tag }: CourseScheduleItemDto) => {
    let color: BaseType | undefined = undefined;
    const start = moment(startDate);
    const end = moment(endDate);

    const isDeadlineSoon = now <= end && end.diff(now, 'hours') < 48 && !score;
    const isCurrent = now >= start && now < end && !score;
    const isDeadlineMissed = now >= end && end.diff(now, 'hours') >= -24 && !score;
    const isPast = now > end || score;

    if (isDeadlineSoon && date === 'end') color = 'warning';
    else if (isCurrent && date === 'start') color = 'success';
    else if (isDeadlineMissed && date === 'end') color = 'danger';
    else if (isPast) color = 'secondary';

    const text = dateWithTimeZoneRenderer(timeZone, format)(value);

    if (tag == CourseScheduleItemDtoTagEnum.SelfStudy) {
      return (
        <Typography.Text type={color}>
          {text}
          <Tooltip placement="topLeft" title={infoText}>
            <InfoCircleOutlined className="ant-typography ant-typography-secondary" style={{ marginLeft: 8 }} />
          </Tooltip>
        </Typography.Text>
      );
    }
    return <Typography.Text type={color}>{text}</Typography.Text>;
  };
};
