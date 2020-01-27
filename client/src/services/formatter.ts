import moment from 'moment-timezone';

export function formatDate(value: string) {
  return moment(value).format('YYYY-MM-DD');
}

export function relativeDays(value: string) {
  return moment().diff(moment(value), 'day');
}

export function formatDateTime(value: string | number) {
  return moment(value).format('YYYY-MM-DD HH:mm');
}

export function formatTimezoneToUTC(value: string, zone: string) {
  return moment(value)
    .tz(zone, true)
    .utc()
    .format('YYYY-MM-DD HH:mmZ');
}

export function formatTime(value: string) {
  return moment(value).format('HH:mm:ssZ');
}

export function formatDateFriendly(value: string) {
  return moment(value).format('DD MMM YYYY');
}

export function formatMonth(value: string) {
  return moment(value).format('YYYY-MM');
}

export function formatMonthFriendly(value: string) {
  return moment(value).format('MMM YYYY');
}
