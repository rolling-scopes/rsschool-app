export enum ViewMode {
  TABLE = 'TABLE',
  LIST = 'LIST',
  CALENDAR = 'CALENDAR',
}

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

export interface ScheduleRow {
  id: number;
  event: {
    name: string;
    descriptionUrl: string;
    type: string;
  };
  dateTime: string;
  place: string;
  organizer: {
    githubId: string;
  } | null;
  special?: [];
  duration?: number;
}

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
