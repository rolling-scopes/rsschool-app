import { Badge, Tag } from 'antd';
import { CourseScheduleItemDto, CourseScheduleItemDtoStatusEnum } from 'api';
import capitalize from 'lodash/capitalize';
import { DEFAULT_TAG_COLOR_MAP, TAG_NAME_MAP } from 'modules/Schedule/constants';
import { getStatusStyle, getTagStyle, getTaskStatusColor } from 'modules/Schedule/utils';

export function statusRenderer(value: CourseScheduleItemDtoStatusEnum) {
  const label = capitalize(value);
  const color = getTaskStatusColor(value);

  return <Badge color={color} text={label} />;
}

export function renderStatusWithStyle(statusName: CourseScheduleItemDtoStatusEnum) {
  return (
    <Tag style={getStatusStyle(statusName)} key={statusName}>
      {capitalize(statusName)}
    </Tag>
  );
}

export function renderTagWithStyle(tagName: CourseScheduleItemDto['tag'], tagColors = DEFAULT_TAG_COLOR_MAP) {
  return (
    <Tag style={getTagStyle(tagName, tagColors)} key={tagName}>
      {TAG_NAME_MAP[tagName] || tagName}
    </Tag>
  );
}
