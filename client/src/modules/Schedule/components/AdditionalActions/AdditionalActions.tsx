import { Button, Dropdown, Menu, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import React from 'react';
import { buildExportLink, buildICalendarLink } from './helpers';
import { SettingsButtons } from '../SettingsPanel';

export type MenuItemType = Required<MenuProps>['items'][number];
type MenuItemClickHandler = Required<MenuProps>['onClick'];

export interface AdditionalActionsProps {
  menuItems: MenuItemType[];
  courseId: number;
  timezone: string;
  calendarToken: string;
  courseAlias: string;
  onCopyFromCourse: () => void;
}

const AdditionalActions = ({
  menuItems,
  courseId,
  timezone,
  calendarToken,
  courseAlias,
  onCopyFromCourse,
}: AdditionalActionsProps) => {
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
      case SettingsButtons.Calendar:
        onCalendarDownload();
        break;
      case SettingsButtons.Export:
        onExport();
        break;
      case SettingsButtons.Copy:
        onCopyFromCourse();
        break;
      default:
        break;
    }
  };

  return (
    <Dropdown
      overlay={<Menu items={menuItems} onClick={handleMenuItemClick} />}
      trigger={['click']}
      placement="bottomRight"
    >
      <Button>
        <Space>
          {SettingsButtons.More}
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  );
};

export default AdditionalActions;
