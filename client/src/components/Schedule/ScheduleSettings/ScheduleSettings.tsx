import React, { useState } from 'react';
import { Button, Drawer, Tooltip, Checkbox } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import ChangeTagColor from './ChangeTagColor';
import ShowTableColumns from './ShowTableColumns';
import TaskLimits from './TaskLimits';
import { Settings } from '../types';

type Props = {
  settings: Settings;
  eventTypes: string[];
};

const ScheduleSettings: React.FC<Props> = ({ settings, eventTypes }) => {
  const [opened, setOpened] = useState(false);
  const openDrawer = () => setOpened(true);
  const closeDrawer = () => setOpened(false);

  return (
    <Tooltip title="Schedule settings" mouseEnterDelay={1}>
      <Button icon={<SettingOutlined />} title="Schedule settings" size="middle" type="primary" onClick={openDrawer} />
      <Drawer title="Schedule Settings" placement="right" closable={false} onClose={closeDrawer} visible={opened}>
        <ShowTableColumns
          eventTypes={eventTypes}
          columnsShown={settings.columnsShown}
          setColumnsShown={settings.setColumnsShown}
          eventTypesHidden={settings.eventTypesHidden}
          setEventTypesHidden={settings.setEventTypesHidden}
        />
        <ChangeTagColor
          tags={eventTypes}
          tagColors={settings.eventTypeTagsColors}
          onSaveTagColors={settings.setEventTypeTagsColors}
        />
        <TaskLimits
          limitForDoneTask={settings.limitForDoneTask}
          onSaveLimitForDoneTask={settings.setLimitForDoneTask}
        />
        <Checkbox value="" checked={settings.splittedByWeek} onChange={({ target: { checked } }) => settings.setSplittedByWeek(checked)}>
          Splitted by week
        </Checkbox>
      </Drawer>
    </Tooltip>
  );
};

export default ScheduleSettings;
