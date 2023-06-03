import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export function formatDate(value: string) {
  return dayjs(value).format('YYYY-MM-DD');
}

export function formatShortDate(value: string) {
  return dayjs(value).format('MMM DD');
}

export function relativeDays(value: string) {
  return dayjs().diff(dayjs(value), 'day');
}

export function formatDateTime(value: string | number) {
  return dayjs(value).format('YYYY-MM-DD HH:mm');
}

export function formatTimezoneToUTC(value: dayjs.ConfigType, zone = 'UTC') {
  return dayjs(value).tz(zone, true).utc().format();
}

export function formatTime(value: string) {
  return dayjs(value).format('HH:mm:ssZ');
}

export function formatDateFriendly(value: string) {
  return dayjs(value).format('DD MMM YYYY');
}

export function formatMonth(value: string) {
  return dayjs(value).format('YYYY-MM');
}

export function formatMonthFriendly(value: string) {
  return dayjs(value).format('MMM YYYY');
}
