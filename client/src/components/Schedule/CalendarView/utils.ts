import moment, { Moment } from 'moment';
import { ScheduleEvent } from '../model';
import { DEFAULT_COLOR } from '../constants';

export function getListData(
  calendarCellDate: Moment,
  data: ScheduleEvent[],
  timeZone: string,
  storedTagColors: object = {},
) {
  return filterByDate(calendarCellDate, data, timeZone).map((el: ScheduleEvent) => {
    const tagColor = storedTagColors[el.type as keyof typeof storedTagColors];
    return {
      color: tagColor || DEFAULT_COLOR,
      name: el.name,
      key: el.id,
      time: moment(el.startDate).tz(timeZone).format('HH:mm'),
      type: el.type,
    };
  });
}

export function filterByDate(calendarCellDate: Moment, data: ScheduleEvent[], timeZone: string) {
  return data.filter(
    event =>
      calendarCellDate.format('YYYY-MM-DD') ===
      moment(event.startDate, 'YYYY-MM-DD HH:mmZ').tz(timeZone).format('YYYY-MM-DD'),
  );
}

export function getMonthValue(calendarCellDate: Moment, data: ScheduleEvent[], timeZone: string) {
  return data.filter(
    event =>
      calendarCellDate.format('MM-YYYY') ===
      moment(event.startDate, 'YYYY-MM-DD HH:mmZ').tz(timeZone).format('MM-YYYY'),
  ).length;
}
