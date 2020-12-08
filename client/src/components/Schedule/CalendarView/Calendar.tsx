import React from 'react';
import MobileCalendar from './components/MobileCalendar';
import DesktopCalendar from './components/DesktopCalendar';
import { CourseEvent } from 'services/course';
import { isMobile } from 'mobile-device-detect';

type Props = {
  data: CourseEvent[];
  timeZone: string;
};

export const CalendarView: React.FC<Props> = ({data, timeZone}) => {

  return <>
    {isMobile
      ? <MobileCalendar data={data} timeZone={timeZone}/>
      : <DesktopCalendar data={data} timeZone={timeZone}/>
    }
  </>
};

