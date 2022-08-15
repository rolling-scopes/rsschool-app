import React, { useState } from 'react';
import { Button, Drawer, Tooltip } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { ScheduleSettings } from '../useScheduleSettings';
import ChangeTagColors from './ChangeTagColors';
import ShowTableColumns from './ShowTableColumns';
import TimeZone from './TimeZone';

interface SettingsDrawerProps {
  settings: ScheduleSettings;
  eventTypes: string[];
}

const TITLE = 'Schedule settings';

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ settings, eventTypes }) => {
  const [opened, setOpened] = useState(false);

  const openDrawer = () => setOpened(true);
  const closeDrawer = () => setOpened(false);

  return (
    <Tooltip title={TITLE} mouseEnterDelay={1}>
      <Button icon={<SettingOutlined />} size="middle" type="primary" onClick={openDrawer} />
      <Drawer title={TITLE} placement="right" closable onClose={closeDrawer} visible={opened}>
        <TimeZone timezone={settings.timezone} setTimezone={settings.setTimezone} />
        <ShowTableColumns
          eventTags={eventTypes}
          columnsHidden={settings.columnsHidden}
          setColumnsHidden={settings.setColumnsHidden}
          eventTagsHidden={settings.eventTypesHidden}
          setEventTagsHidden={settings.setEventTypesHidden}
          closeDrawer={closeDrawer}
        />
        <ChangeTagColors tags={eventTypes} tagColors={settings.tagColors} setTagColors={settings.setTagColors} />
      </Drawer>
    </Tooltip>
  );
};

export default SettingsDrawer;
