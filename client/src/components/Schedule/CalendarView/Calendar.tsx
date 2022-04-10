import React from 'react';
import { ConfigProvider } from 'antd';
import MobileCalendar from './MobileCalendar';
import DesktopCalendar from './DesktopCalendar';
import { isMobile } from 'mobile-device-detect';
import en_GB from 'antd/lib/locale-provider/en_GB';
import { ScheduleViewProps } from 'components/Schedule/ScheduleView';

export const CalendarView: React.FC<ScheduleViewProps> = ({ data, courseAlias, settings }) => {
  return (
    <>
      <ConfigProvider locale={en_GB}>
        {isMobile ? (
          <MobileCalendar
            data={data}
            timeZone={settings.timezone}
            storedTagColors={settings.tagColors}
            alias={courseAlias}
          />
        ) : (
          <DesktopCalendar
            data={data}
            timeZone={settings.timezone}
            storedTagColors={settings.tagColors}
            alias={courseAlias}
          />
        )}
      </ConfigProvider>
    </>
  );
};
