import { CourseScheduleItemDto, CourseScheduleItemDtoStatusEnum, CourseScheduleItemDtoTagEnum } from 'api';

export enum ColumnName {
  Status = 'Status',
  StartDate = 'Start Date',
  EndDate = 'End Date',
  Time = 'Time',
  Type = 'Type',
  Name = 'Task / Event',
  Organizer = 'Organizer',
  Score = 'Score / Max',
  Weight = 'Weight',
}

export enum ColumnKey {
  Status = 'status',
  StartDate = 'studentStartDate',
  EndDate = 'studentEndDate',
  Type = 'type',
  Name = 'name',
  Organizer = 'organizer',
  Score = 'score',
  Weight = 'scoreWeight',
}

export const COLUMNS: { key: ColumnKey; name: ColumnName }[] = [
  { key: ColumnKey.Status, name: ColumnName.Status },
  { key: ColumnKey.Name, name: ColumnName.Name },
  { key: ColumnKey.StartDate, name: ColumnName.StartDate },
  { key: ColumnKey.EndDate, name: ColumnName.EndDate },
  { key: ColumnKey.Type, name: ColumnName.Type },
  { key: ColumnKey.Organizer, name: ColumnName.Organizer },
  { key: ColumnKey.Weight, name: ColumnName.Weight },
  { key: ColumnKey.Score, name: ColumnName.Score },
];

export enum LocalStorageKeys {
  ViewMode = 'scheduleViewMode',
  Timezone = 'scheduleTimezone',
  IsSplittedByWeek = 'scheduleIsSplitedByWeek',
  TagColors = 'scheduleTagsColors',
  ColumnsHidden = 'scheduleColumnsHidden',
  EventTypesHidden = 'scheduleEventTypesHidden',
  StatusFilter = 'scheduleStatusFilter',
  TagFilter = 'scheduleTagFilter',
}

export const TAG_NAME_MAP: Record<CourseScheduleItemDto['tag'], string> = {
  coding: 'Coding',
  interview: 'Interview',
  test: 'Test',
  'cross-check-submit': 'Cross-Check: Submit',
  'cross-check-review': 'Cross-Check: Review',
  'self-study': 'Self-study',
  lecture: 'Lecture',
};

export const SCHEDULE_STATUSES = Object.keys(CourseScheduleItemDtoStatusEnum).map(key => ({
  value: (CourseScheduleItemDtoStatusEnum as any)[key] as CourseScheduleItemDtoStatusEnum,
  text: key,
}));

export const TAGS = Object.values(CourseScheduleItemDtoTagEnum).map((value: CourseScheduleItemDtoTagEnum) => ({
  value: value,
  text: TAG_NAME_MAP[value],
}));

export const CONFIGURABLE_COLUMNS = [
  ColumnKey.StartDate,
  ColumnKey.EndDate,
  ColumnKey.Type,
  ColumnKey.Organizer,
  ColumnKey.Score,
  ColumnKey.Weight,
];

export const DEADLINE_COLOR = '#ff0000';
export const DEFAULT_COLOR = '#308e00';

export const DEFAULT_TAG_COLOR_MAP: Record<CourseScheduleItemDto['tag'], string> = {
  coding: '#722ed1',
  interview: '#1677ff',
  test: '#faad14',
  'cross-check-submit': '#13c2c2',
  'cross-check-review': '#36A836',
  'self-study': '#595959',
  lecture: '#eb2f96',
};

export const SPECIAL_TASK_TYPES = {
  deadline: 'deadline',
  test: 'test',
};

export const SPECIAL_ENTITY_TAGS = [
  'optional',
  'live',
  'record',
  'js',
  'node.js',
  'react',
  'angular',
  'css',
  'html',
  'git',
  'markdown',
  'mobile',
  'kotlin',
  'aws',
  'jupyter',
];

export const CHECKER_TYPES = {
  'auto-test': 'Auto-Test',
  mentor: 'Mentor',
  assigned: 'Cross-Mentor',
  taskOwner: 'Task Owner',
  crossCheck: 'Cross-Check',
};

export const ALL_TAB_KEY = 'all';
export const ALL_TAB_LABEL = 'All';
