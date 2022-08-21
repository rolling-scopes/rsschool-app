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
    <Tooltip title={TITLE} mouseEnterDelay={1}>
      <Button icon={<SettingOutlined />} onClick={openDrawer} />
      <Drawer title={TITLE} placement="right" closable onClose={closeDrawer} visible={opened}>
        <TimeZone timezone={settings.timezone} setTimezone={settings.setTimezone} />
        <ShowTableColumns
          tags={tags}
          columnsHidden={settings.columnsHidden}
          setColumnsHidden={settings.setColumnsHidden}
          eventTagsHidden={settings.tagsHidden}
          setTagsHidden={settings.setTagsHidden}
          closeDrawer={closeDrawer}
        />
        <ChangeTagColors tags={tags} tagColors={settings.tagColors} setTagColors={settings.setTagColors} />
      </Drawer>
    </Tooltip>
  );
}

export default SettingsDrawer;
