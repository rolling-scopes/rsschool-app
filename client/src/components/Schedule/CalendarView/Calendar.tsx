import React from 'react';
//import MiniCalendar from './components/MobileCalendar';
//import useWindowDimensions from './utils/useWindowDimensions';
import DesktopCalendar from './components/DesktopCalendar';
import { CourseEvent } from 'services/course';

type Props = {
  data: CourseEvent[];
  timeZone: string;
};

export const CalendarView: React.FC<Props> = ({data, timeZone}) => {
  //const { width } = useWindowDimensions();

  return <>
    <DesktopCalendar data={data} timeZone={timeZone}/>
  </>
};

