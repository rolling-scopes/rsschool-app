import { CourseScheduleItemDtoStatusEnum } from 'api';
import { DEFAULT_COLOR } from 'modules/Schedule/constants';
import { CSSProperties } from 'react';

export const getTagStyle = (tagName: string, tagColors: Record<string, string> = {}, styles?: CSSProperties) => {
  const tagColor = tagColors[tagName] || DEFAULT_COLOR;
  return {
    ...styles,
    borderColor: tagColor,
    color: tagColor,
    backgroundColor: `${tagColor}10`,
  };
};

export function getTaskStatusColor(value: CourseScheduleItemDtoStatusEnum) {
  switch (value) {
    case CourseScheduleItemDtoStatusEnum.Done:
      return '#52c41a';
    case CourseScheduleItemDtoStatusEnum.Missed:
      return '#ff4d4f';
    case CourseScheduleItemDtoStatusEnum.Archived:
      return '#d9d9d9';
    case CourseScheduleItemDtoStatusEnum.Available:
      return '#1890ff';
    case CourseScheduleItemDtoStatusEnum.Future:
      return '#13c2c2';
    case CourseScheduleItemDtoStatusEnum.Review:
      return '#722ed1';
    default:
      return '#d9d9d9';
  }
}
