import React from 'react';
import MobileCalendar from './components/MobileCalendar';
import DesktopCalendar from './components/DesktopCalendar';
import { CourseEvent } from 'services/course';
import { isMobile } from 'mobile-device-detect';

type Props = {
  data: CourseEvent[];
  timeZone: string;
  storedTagColors?: object;
  alias: string;
};

export const CalendarView: React.FC<Props> = ({ data, timeZone, storedTagColors, alias }) => {
  return (
    <>
      {isMobile ? (
        <MobileCalendar data={data} timeZone={timeZone} storedTagColors={storedTagColors} alias={alias} />
      ) : (
        <DesktopCalendar data={data} timeZone={timeZone} storedTagColors={storedTagColors} alias={alias} />
      )}
    </>
  );
};
