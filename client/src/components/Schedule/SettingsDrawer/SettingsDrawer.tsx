import React, { useState } from 'react';
import { Button, Drawer, Tooltip, Checkbox } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { ScheduleSettings } from '../useScheduleSettings';
import ChangeTagColors from './ChangeTagColors';
import ShowTableColumns from './ShowTableColumns';
import TaskLimits from './TaskLimits';

interface SettingsDrawerProps {
  settings: ScheduleSettings;
  eventTypes: string[];
}

const TITLE = 'Schedule settings';

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ settings, eventTypes }) => {
  const [opened, setOpened] = useState(false);

  const openDrawer = () => setOpened(true);
  const closeDrawer = () => setOpened(false);
  const toggleSplittedByWeek = ({ target }: CheckboxChangeEvent) => settings.setIsSplittedByWeek(target.checked);

  return (
    <Tooltip title={TITLE} mouseEnterDelay={1}>
      <Button icon={<SettingOutlined />} title={TITLE} size="middle" type="primary" onClick={openDrawer} />
      <Drawer title={TITLE} placement="right" closable={false} onClose={closeDrawer} visible={opened}>
        <ShowTableColumns
          eventTypes={eventTypes}
          columnsHidden={settings.columnsHidden}
          setColumnsHidden={settings.setColumnsHidden}
          eventTypesHidden={settings.eventTypesHidden}
          setEventTypesHidden={settings.setEventTypesHidden}
        />
        <ChangeTagColors tags={eventTypes} tagColors={settings.tagColors} setTagColors={settings.setTagColors} />
        <TaskLimits limitForDoneTask={settings.limitForDoneTask} setLimitForDoneTask={settings.setLimitForDoneTask} />
        <Checkbox value checked={settings.isSplittedByWeek} onChange={toggleSplittedByWeek}>
          Splitted by week
        </Checkbox>
      </Drawer>
    </Tooltip>
  );
};

export default SettingsDrawer;
