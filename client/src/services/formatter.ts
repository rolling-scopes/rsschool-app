import moment from 'moment';

export function formatDate(value: string) {
  return moment(value).format('YYYY-MM-DD');
}

export function formatDateTime(value: string) {
  return moment(value).format('YYYY-MM-DD HH:mm');
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
