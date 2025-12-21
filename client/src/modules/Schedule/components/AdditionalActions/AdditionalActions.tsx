import { Button, Dropdown, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import React from 'react';
import { buildExportLink, buildICalendarLink, setExportLink } from './helpers';
import { SettingsButtons } from '../SettingsPanel';
import { useCopyToClipboard } from 'react-use';
import { useMessage } from 'hooks';

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
  const { message } = useMessage();
  const [, copyToClipboard] = useCopyToClipboard();

  const onExport = () => {
    setExportLink(buildExportLink(courseId, timezone));
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

  function onCalendarCopyLink() {
    const link = buildICalendarLink(courseId, calendarToken, timezone);
    copyToClipboard(`${window.document.location.origin}${link}`);
    message.success('Copied to clipboard');
  }

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
    <Dropdown menu={{ items: menuItems, onClick: handleMenuItemClick }} trigger={['click']} placement="bottomRight">
      <Button data-testid={SettingsButtons.More}>
        <Space>
          {SettingsButtons.More}
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  );
};

export default AdditionalActions;
