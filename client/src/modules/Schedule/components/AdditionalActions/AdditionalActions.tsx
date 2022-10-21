import { Button, Col, Dropdown, Menu, Space } from 'antd';
import type { MenuProps } from 'antd';
import { DownOutlined, CalendarOutlined, FileExcelOutlined, CopyOutlined } from '@ant-design/icons';
import React, { useMemo } from 'react';
import { buildExportLink, buildICalendarLink, buildMenuItem } from './helpers';

type MenuItemClickHandler = Required<MenuProps>['onClick'];

export interface AdditionalActionsProps {
  isCourseManager: boolean;
  courseId: number;
  timezone: string;
  calendarToken: string;
  courseAlias: string;
  onCopyFromCourse: () => void;
}

export enum AdditionalItems {
  Calendar = 'iCal Link',
  Export = 'Export',
  Copy = 'Copy from',
}

const AdditionalActions = ({
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
        buildMenuItem(AdditionalItems.Calendar, <CalendarOutlined />, !!calendarToken),
        buildMenuItem(AdditionalItems.Export, <FileExcelOutlined />, isCourseManager),
        buildMenuItem(AdditionalItems.Copy, <CopyOutlined />, isCourseManager),
      ].filter(Boolean),
    [calendarToken, isCourseManager],
  );

  const onExport = () => {
    window.location.href = buildExportLink(courseId, timezone);
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

  return menuItems?.length !== 0 ? (
    <Col>
      <Dropdown overlay={dropdownMenu} trigger={['click']} placement="bottomRight">
        <Button>
          <Space>
            More
            <DownOutlined />
          </Space>
        </Button>
      </Dropdown>
    </Col>
  ) : null;
};

export default AdditionalActions;
