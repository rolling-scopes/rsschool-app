export enum ViewMode {
  TABLE = 'TABLE',
  LIST = 'LIST',
  CALENDAR = 'CALENDAR',
}
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
  };
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
];

export const TASK_TYPES = [
  'JS task',
  'Kotlin task',
  'ObjC task',
  'HTML task',
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
];
