import moment from 'moment';

export function formatDate(value: string) {
  return moment(value).format('YYYY-MM-DD');
}

export function formatMonth(value: string) {
  return moment(value).format('YYYY-MM');
}

export function formatMonthFriendly(value: string) {
  return moment(value).format('MMM YYYY');
}
