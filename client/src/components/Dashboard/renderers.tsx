import moment from 'moment-timezone';

export function dateTimeTimeZoneRenderer(value: string | null, timeZone: string) {
  return value
    ? moment(value)
        .tz(timeZone)
        .format('YYYY-MM-DD HH:mm')
    : '';
}
