import type { MenuProps } from 'antd';

type MenuItemType = Required<MenuProps>['items'][number];

export const buildICalendarLink = (courseId: number, token: string, timezone: string) =>
  `/api/v2/courses/${courseId}/icalendar/${token}?timezone=${encodeURIComponent(timezone || '')}`;

export const buildExportLink = (courseId: number, timezone: string) =>
  `/api/course/${courseId}/schedule/csv/${timezone.replace('/', '_')}`;

export const buildMenuItem = (title: string, icon: React.ReactNode, isVisible: boolean): MenuItemType | null =>
  isVisible
    ? {
        key: title,
        label: title,
        icon: icon,
      }
    : null;
