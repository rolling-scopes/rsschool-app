import React from 'react';
import MobileCalendar from './components/MobileCalendar';
import useWindowDimensions from './utils/useWindowDimensions';
import DesktopCalendar from './components/DesktopCalendar';
import { CourseEvent } from 'services/course';

type Props = {
  data: CourseEvent[];
  timeZone: string;
};

export const CalendarView: React.FC<Props> = ({data, timeZone}) => {
  const { width } = useWindowDimensions();

  return <>
    {width > 750
      ? <DesktopCalendar data={data} timeZone={timeZone}/>
      : <MobileCalendar data={data} timeZone={timeZone}/>
    }
  </>
};

