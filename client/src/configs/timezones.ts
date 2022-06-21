import moment from 'moment-timezone';

export const ALL_TIMEZONES = moment.tz.names();

export const TIMEZONES = [
  'UTC',
  'Europe/London',
  'Europe/Warsaw',
  'Europe/Kiev',
  'Europe/Minsk',
  'Europe/Moscow',
  'Europe/Volgograd',
  'Asia/Yekaterinburg',
  'Asia/Tashkent',
  'Asia/Tbilisi',
];

export const DEFAULT_TIMEZONE = 'Europe/Minsk';
