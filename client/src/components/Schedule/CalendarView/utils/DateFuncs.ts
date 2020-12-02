import moment, { Moment } from 'moment';
import { CourseEvent } from 'services/course';


export function filterByDate(calendarCellDate: Moment, data: CourseEvent[], timeZone: string) {
  //plug!
  const newTimeZone = timeZone === 'Europe/Yekaterinburg' ? 'Asia/Yekaterinburg' : timeZone;

  return data.filter(
    (event) => calendarCellDate.format('YYYY-MM-DD') === moment(event.dateTime, 'YYYY-MM-DD HH:mmZ').tz(newTimeZone).format('YYYY-MM-DD'),
  );
}

export function getMonthValue(calendarCellDate: Moment, data: CourseEvent[], timeZone: string) {
  //plug!
  const newTimeZone = timeZone === 'Europe/Yekaterinburg' ? 'Asia/Yekaterinburg' : timeZone;

  return data.filter(
    (event) => calendarCellDate.format('MM-YYYY') === moment(event.dateTime, 'YYYY-MM-DD HH:mmZ').tz(newTimeZone).format('MM-YYYY'),
  ).length;
}
