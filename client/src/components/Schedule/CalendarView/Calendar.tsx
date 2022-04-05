import React from 'react';
import { ConfigProvider } from 'antd';
import MobileCalendar from './MobileCalendar';
import DesktopCalendar from './DesktopCalendar';
import { CourseEvent } from 'services/course';
import { isMobile } from 'mobile-device-detect';
import en_GB from 'antd/lib/locale-provider/en_GB';

type Props = {
  data: CourseEvent[];
  timeZone: string;
  storedTagColors?: object;
  alias: string;
};

export const CalendarView: React.FC<Props> = ({ data, timeZone, storedTagColors, alias }) => {
  return (
    <>
      <ConfigProvider locale={en_GB}>
        {isMobile ? (
          <MobileCalendar data={data} timeZone={timeZone} storedTagColors={storedTagColors} alias={alias} />
        ) : (
          <DesktopCalendar data={data} timeZone={timeZone} storedTagColors={storedTagColors} alias={alias} />
        )}
      </ConfigProvider>
    </>
  );
};
