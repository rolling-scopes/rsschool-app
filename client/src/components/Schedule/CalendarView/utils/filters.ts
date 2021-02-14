import moment, { Moment } from 'moment';
import { CourseEvent } from 'services/course';
import { DEFAULT_COLOR } from 'components/Schedule/UserSettings/userSettingsHandlers';

export function getListData(
  calendarCellDate: Moment,
  data: CourseEvent[],
  timeZone: string,
  storedTagColors: object = {},
) {
  return filterByDate(calendarCellDate, data, timeZone).map((el: CourseEvent) => {
    const tagColor = storedTagColors[el.event.type as keyof typeof storedTagColors];
    return { color: tagColor || DEFAULT_COLOR, name: el.event.name, key: el.id };
  });
}

export function filterByDate(calendarCellDate: Moment, data: CourseEvent[], timeZone: string) {
  return data.filter(
    event =>
      calendarCellDate.format('YYYY-MM-DD') ===
      moment(event.dateTime, 'YYYY-MM-DD HH:mmZ').tz(timeZone).format('YYYY-MM-DD'),
  );
}

export function getMonthValue(calendarCellDate: Moment, data: CourseEvent[], timeZone: string) {
  return data.filter(
    event =>
      calendarCellDate.format('MM-YYYY') === moment(event.dateTime, 'YYYY-MM-DD HH:mmZ').tz(timeZone).format('MM-YYYY'),
  ).length;
}
