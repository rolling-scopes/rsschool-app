import { filterByDate } from './DateFuncs';
import { CourseEvent } from 'services/course';
import { EventTypeColor} from 'components/Schedule/model';
import {Moment} from 'moment';


export function getListData(calendarCellDate: Moment, data: CourseEvent[], timeZone: string) {
  const listData: { color: string; name: string; key: number }[] = [];

  filterByDate(calendarCellDate, data, timeZone).forEach((el: CourseEvent) => {
    const tagColor = EventTypeColor[el.event.type as keyof typeof EventTypeColor];
    listData.push({ color: tagColor ? tagColor : '#d9d9d9' , name: el.event.name, key: el.id });
  });

  return listData;
}
