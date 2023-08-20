import { Button, Dropdown, Menu, message, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import React, { useContext } from 'react';
import { buildExportLink, buildICalendarLink } from './helpers';
import { SettingsButtons } from '../SettingsPanel';
import { useCopyToClipboard } from 'react-use';
import { SessionAndCourseContext } from 'modules/Course/contexts';

export type MenuItemType = Required<MenuProps>['items'][number];
type MenuItemClickHandler = Required<MenuProps>['onClick'];

export interface AdditionalActionsProps {
  menuItems: MenuItemType[];
  timezone: string;
  calendarToken: string;
  onCopyFromCourse: () => void;
}

const AdditionalActions = ({ menuItems, timezone, calendarToken, onCopyFromCourse }: AdditionalActionsProps) => {
  const [, copyToClipboard] = useCopyToClipboard();
  const { activeCourse } = useContext(SessionAndCourseContext);

  if (!activeCourse) return null;

  const onExport = () => {
    window.location.href = buildExportLink(activeCourse.id, timezone);
  };

  const onCalendarDownload = () => {
    if (calendarToken) {
      const iCalLink = buildICalendarLink(activeCourse.id, calendarToken, timezone);

      const link = document.createElement('a');
      link.href = iCalLink;
      link.target = '_blank';
      link.setAttribute('download', `schedule-${activeCourse.alias}.ics`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  const onCalendarCopyLink = () => {
    const link = buildICalendarLink(activeCourse.id, calendarToken, timezone);
    copyToClipboard(`${window.document.location.origin}${link}`);
    message.success('Copied to clipboard');
  };

  const handleMenuItemClick: MenuItemClickHandler = item => {
    switch (item.key) {
      case SettingsButtons.CopyLink:
        onCalendarCopyLink();
        break;
      case SettingsButtons.Download:
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
