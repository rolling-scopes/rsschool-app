import { Badge, Tag } from 'antd';
import { CourseScheduleItemDtoStatusEnum } from 'api';
import { getTagStyle } from 'modules/Schedule/utils';
import capitalize from 'lodash/capitalize';

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
