import { CourseTaskDtoTypeEnum, CourseScheduleItemDtoStatusEnum, CourseEventDtoTypeEnum } from 'api';

export enum ColumnName {
  Status = 'Status',
  StartDate = 'Start Date',
  EndDate = 'End Date',
  Time = 'Time',
  Tags = 'Tags',
  Name = 'Task / Event',
  Organizer = 'Organizer',
  Score = 'Score / Max',
  Weight = 'Weight',
}

export enum ColumnKey {
  Status = 'status',
  StartDate = 'studentStartDate',
  EndDate = 'studentEndDate',
  Tags = 'tags',
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
  { key: ColumnKey.Tags, name: ColumnName.Tags },
  { key: ColumnKey.Organizer, name: ColumnName.Organizer },
  { key: ColumnKey.Weight, name: ColumnName.Weight },
  { key: ColumnKey.Score, name: ColumnName.Score },
];

export enum LocalStorageKeys {
  ViewMode = 'scheduleViewMode',
  Timezone = 'scheduleTimezone',
  IsSplittedByWeek = 'scheduleIsSplitedByWeek',
  TagColors = 'scheduleTagColors',
  ColumnsHidden = 'scheduleColumnsHidden',
  EventTypesHidden = 'scheduleEventTypesHidden',
  StatusFilter = 'scheduleStatusFilter',
}

export const SCHEDULE_STATUSES = Object.keys(CourseScheduleItemDtoStatusEnum).map(key => ({
  value: (CourseScheduleItemDtoStatusEnum as any)[key] as CourseScheduleItemDtoStatusEnum,
  text: key,
}));

export const CONFIGURABLE_COLUMNS = [
  ColumnKey.StartDate,
  ColumnKey.EndDate,
  ColumnKey.Tags,
  ColumnKey.Organizer,
  ColumnKey.Score,
  ColumnKey.Weight,
];

export const DEADLINE_COLOR = '#ff0000';
export const DEFAULT_COLOR = '#308e00';

export const DEFAULT_COLORS = {
  [CourseTaskDtoTypeEnum.Cvhtml]: '#004dcf',
  [CourseTaskDtoTypeEnum.Cvmarkdown]: '#2db7f5',
  [CourseTaskDtoTypeEnum.Codejam]: '#fa28ff',
  [CourseTaskDtoTypeEnum.Codewars]: '#b04df0',
  [CourseTaskDtoTypeEnum.Htmltask]: DEFAULT_COLOR,
  [CourseEventDtoTypeEnum.Info]: '#13c2c2',
  [CourseTaskDtoTypeEnum.Interview]: '#13c2c2',
  [CourseTaskDtoTypeEnum.Jstask]: '#4b5a59',
  [CourseTaskDtoTypeEnum.Kotlintask]: '#ffa940',
  [CourseEventDtoTypeEnum.Meetup]: '#2db7f5',
  [CourseTaskDtoTypeEnum.Objctask]: '#13c2c2',
  [CourseEventDtoTypeEnum.LectureOffline]: '#fa28ff',
  [CourseEventDtoTypeEnum.LectureOnline]: '#b04df0',
  [CourseEventDtoTypeEnum.LectureMixed]: '#959e3c',
  [CourseTaskDtoTypeEnum.Selfeducation]: '#959e3c',
  [CourseEventDtoTypeEnum.LectureSelfStudy]: '#4b5a59',
  [CourseEventDtoTypeEnum.Special]: DEFAULT_COLOR,
  [CourseTaskDtoTypeEnum.StageInterview]: '#ffa940',
  [CourseTaskDtoTypeEnum.Test]: '#4b5a59',
  [CourseEventDtoTypeEnum.Warmup]: '#ffa940',
  [CourseEventDtoTypeEnum.Webinar]: '#004dcf',
  [CourseEventDtoTypeEnum.Workshop]: DEFAULT_COLOR,
  [CourseTaskDtoTypeEnum.Ipynb]: '#fa28ff',
  default: DEFAULT_COLOR,
  deadline: DEADLINE_COLOR,
  [CourseEventDtoTypeEnum.CrossCheckDeadline]: DEADLINE_COLOR,
};

export const PICKER_COLORS = [
  '#4b5a59',
  '#ffa940',
  '#13c2c2',
  '#2db7f5',
  '#004dcf',
  '#b04df0',
  '#fa28ff',
  '#959e3c',
  '#9ce20d',
  '#24db00',
  '#ff7a45',
  '#ae8989',
  '#9321a2',
  DEADLINE_COLOR,
  DEFAULT_COLOR,
];

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
