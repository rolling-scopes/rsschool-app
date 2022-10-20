import { Button, Dropdown, Menu, Space } from 'antd';
import type { MenuProps } from 'antd';
import { DownOutlined, CalendarOutlined, FileExcelOutlined, CopyOutlined } from '@ant-design/icons';
import React, { useMemo } from 'react';

type MenuItemClickHandler = Required<MenuProps>['onClick'];
type MenuItemType = Required<MenuProps>['items'][number];

interface AdditionalActionsProps {
  isCourseManager: boolean;
  courseId: number;
  timezone: string;
  calendarToken: string;
  courseAlias: string;
  onCopyFromCourse: () => void;
}

const getMenuItem = (title: string, icon: React.ReactNode, isVisible: boolean): MenuItemType | null =>
  isVisible
    ? {
        key: title,
        label: title,
        icon: icon,
      }
    : null;

function buildICalendarLink(courseId: number, token: string, timezone: string) {
  return `/api/v2/courses/${courseId}/icalendar/${token}?timezone=${encodeURIComponent(timezone || '')}`;
}

enum AdditionalItems {
  Calendar = 'iCal Link',
  Export = 'Export',
  Copy = 'Copy from',
}

export const AdditionalActions = ({
  isCourseManager,
  courseId,
  timezone,
  calendarToken,
  courseAlias,
  onCopyFromCourse,
}: AdditionalActionsProps) => {
  const menuItems = useMemo(
    () =>
      [
        getMenuItem(AdditionalItems.Calendar, <CalendarOutlined />, !!calendarToken),
        getMenuItem(AdditionalItems.Export, <FileExcelOutlined />, isCourseManager),
        getMenuItem(AdditionalItems.Copy, <CopyOutlined />, isCourseManager),
      ].filter(Boolean),
    [calendarToken, isCourseManager],
  );

  const onExport = () => {
    window.location.href = `/api/course/${courseId}/schedule/csv/${timezone.replace('/', '_')}`;
  };

  const onCalendarDownload = () => {
    if (calendarToken) {
      const iCalLink = buildICalendarLink(courseId, calendarToken, timezone);

      const link = document.createElement('a');
      link.href = iCalLink;
      link.target = '_blank';
      link.setAttribute('download', `schedule-${courseAlias}.ics`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  const handleMenuItemClick: MenuItemClickHandler = item => {
    switch (item.key) {
      case AdditionalItems.Calendar:
        onCalendarDownload();
        break;
      case AdditionalItems.Export:
        onExport();
        break;
      case AdditionalItems.Copy:
        onCopyFromCourse();
        break;
      default:
        break;
    }
  };

  const dropdownMenu = <Menu items={menuItems} onClick={handleMenuItemClick} />;

  return (
    <Dropdown overlay={dropdownMenu} trigger={['click']}>
      <Button>
        <Space>
          More
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  );
};
