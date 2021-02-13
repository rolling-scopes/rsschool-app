export enum EventTypeColor {
  deadline = 'red',
  test = '#63ab91',
  jstask = 'green',
  htmltask = 'green',
  selfeducation = 'green',
  externaltask = 'green',
  codewars = 'green',
  codejam = 'green',
  newtask = 'green',
  lecture = 'blue',
  lecture_online = 'blue',
  lecture_offline = 'blue',
  lecture_mixed = 'blue',
  lecture_self_study = 'blue',
  info = '#ff7b00',
  warmup = '#63ab91',
  meetup = '#bde04a',
  workshop = '#bde04a',
  interview = '#63ab91',
}

export const EventTypeToName: Record<string, string> = {
  lecture_online: 'online lecture',
  lecture_offline: 'offline lecture',
  lecture_mixed: 'mixed lecture',
  lecture_self_study: 'self study',
  warmup: 'warm-up',
  jstask: 'js task',
  kotlintask: 'kotlin task',
  objctask: 'objc task',
  htmltask: 'html task',
  codejam: 'code jam',
  externaltask: 'external task',
  codewars: 'codewars',
  selfeducation: 'self education',
  // TODO: Left hardcoded (codewars:stage1|codewars:stage2) configs only for backward compatibility. Delete them in the future.
  'codewars:stage1': 'codewars',
  'codewars:stage2': 'codewars',
};

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
] as const;

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
] as const;

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
