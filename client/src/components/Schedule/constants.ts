import { isMobileOnly } from 'mobile-device-detect';
import { CourseTaskDtoTypeEnum } from 'api';

export enum ViewMode {
  Table = 'Table',
  List = 'List',
  Calendar = 'Calendar',
}

export const DEFAULT_VIEW_MODE = isMobileOnly ? ViewMode.List : ViewMode.Table;

export enum Column {
  Date = 'Date',
  Time = 'Time',
  Type = 'Type',
  Special = 'Special',
  Name = 'Name',
  Organizer = 'Organizer',
  Score = 'Score',
}

export const CONFIGURABLE_COLUMNS = ['Type', 'Special', 'Organizer', 'Score'];

export enum LocalStorage {
  ViewMode = 'scheduleViewMode',
  LimitForDoneTasks = 'scheduleLimitForDoneTask',
  IsSplittedByWeek = 'scheduleIsSplitedByWeek',
  ArePassedEventsHidden = 'scheduleArePassedEventsHidden',
  AreDoneTasksHidden = 'scheduleAreDoneTasksHidden',
  TagColors = 'scheduleTagColors',
  ColumnsHidden = 'scheduleColumnsHidden',
  EventTypesHidden = 'scheduleEventTypesHidden',
}

export const DEADLINE_COLOR = '#ff0000';
export const DEFAULT_COLOR = '#308e00';

export const DEFAULT_COLORS = {
  [CourseTaskDtoTypeEnum.Cvhtml]: '#004dcf',
  [CourseTaskDtoTypeEnum.Cvmarkdown]: '#2db7f5',
  [CourseTaskDtoTypeEnum.Codejam]: '#fa28ff',
  'Code review': '#b04df0',
  [CourseTaskDtoTypeEnum.Codewars]: '#b04df0',
  'Cross-check': '#004dcf',
  [CourseTaskDtoTypeEnum.Htmltask]: DEFAULT_COLOR,
  Info: '#13c2c2',
  [CourseTaskDtoTypeEnum.Interview]: '#13c2c2',
  [CourseTaskDtoTypeEnum.Jstask]: '#4b5a59',
  [CourseTaskDtoTypeEnum.Kotlintask]: '#ffa940',
  Meetup: '#2db7f5',
  [CourseTaskDtoTypeEnum.Objctask]: '#13c2c2',
  'Offline Lecture': '#fa28ff',
  'Online Lecture': '#b04df0',
  'Online/Offline Lecture': '#959e3c',
  [CourseTaskDtoTypeEnum.Selfeducation]: '#959e3c',
  'Self-studying': '#4b5a59',
  Special: DEFAULT_COLOR,
  Task: '#2db7f5',
  [CourseTaskDtoTypeEnum.StageInterview]: '#ffa940',
  [CourseTaskDtoTypeEnum.Test]: '#4b5a59',
  'Warm-up': '#ffa940',
  Webinar: '#004dcf',
  Workshop: DEFAULT_COLOR,
  [CourseTaskDtoTypeEnum.Ipynb]: '#fa28ff',
  deadline: DEADLINE_COLOR,
  default: DEFAULT_COLOR,
  'Cross-Check deadline': DEADLINE_COLOR,
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

export const EVENT_TYPES = [
  'Online Lecture',
  'Offline Lecture',
  'Online/Offline Lecture',
  'Self-studying',
  'Warm-up',
  'Info',
  'Workshop',
  'Meetup',
  'Webinar',
  'Special',
  'Code review',
  'Cross-Check deadline',
];

export const TASK_TYPES = [
  'JS task',
  'Kotlin task',
  'ObjC task',
  'HTML task',
  'Jupyter Notebook',
  'CV Markdown',
  'CV HTML',
  'Codewars',
  'Code Jam',
  'Self Education',
  'Test',
  'Technical Screening',
  'Interview',
  'Special',
  'Task',
  'Cross-check',
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
