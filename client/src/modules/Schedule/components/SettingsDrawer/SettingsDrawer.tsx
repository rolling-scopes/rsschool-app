import { SettingOutlined } from '@ant-design/icons';
import { Button, Drawer, Tooltip } from 'antd';
import React, { useState } from 'react';
import { ScheduleSettings } from 'modules/Schedule/hooks/useScheduleSettings';
import ChangeTagColors from './ChangeTagColors';
import ShowTableColumns from './ShowTableColumns';
import TimeZone from './TimeZone';
import { CourseScheduleItemDtoTagEnum } from 'api';

interface SettingsDrawerProps {
  settings: ScheduleSettings;
  tags: CourseScheduleItemDtoTagEnum[];
}

const TITLE = 'Schedule settings';

export function SettingsDrawer({ settings, tags }: SettingsDrawerProps) {
  const [opened, setOpened] = useState(false);

  const openDrawer = () => setOpened(true);
  const closeDrawer = () => setOpened(false);

  return (
    <>
      <Tooltip title="Table settings" placement="left">
        <Button
          data-testid="Settings"
          title="Settings"
          shape="circle"
          type="text"
          icon={<SettingOutlined style={{ fontSize: '2.5ch' }} />}
          onClick={openDrawer}
        />
      </Tooltip>
      <Drawer title={TITLE} placement="right" closable onClose={closeDrawer} open={opened}>
        <TimeZone timezone={settings.timezone} setTimezone={settings.setTimezone} />
        <ShowTableColumns columnsHidden={settings.columnsHidden} setColumnsHidden={settings.setColumnsHidden} />
        <ChangeTagColors tags={tags} tagColors={settings.tagColors} setTagColors={settings.setTagColors} />
      </Drawer>
    </>
  );
}

export default SettingsDrawer;
