import isEqual from 'lodash/isEqual';
import React, { useState, useMemo } from 'react';
import { Button, Divider, Typography, Checkbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { FilterOutlined } from '@ant-design/icons';
import { COLUMNS, CONFIGURABLE_COLUMNS } from '../constants';
import SettingsItem from './SettingsItem';
import { TASK_EVENT_TYPES_MAP } from 'data';

const { Text } = Typography;

const TAG_NAMES_MAP = TASK_EVENT_TYPES_MAP;

const AVAILABLE_COLUMNS = COLUMNS.filter(column => CONFIGURABLE_COLUMNS.includes(column.key));

interface ShowTableColumnsProps {
  eventTags: string[];
  columnsHidden: string[];
  setColumnsHidden: (value: string[]) => void;
  eventTagsHidden: string[];
  setEventTagsHidden: (value: string[]) => void;
  closeDrawer: () => void;
}

const ShowTableColumns: React.FC<ShowTableColumnsProps> = ({
  eventTags,
  closeDrawer,
  columnsHidden: initialColumnsHidden,
  setColumnsHidden: setInitialColumnsHidden,
  eventTagsHidden: initialEventTypesHidden,
  setEventTagsHidden: setInitialEventTypesHidden,
}) => {
  const [columnsHidden, setColumnsHidden] = useState<string[]>(initialColumnsHidden);
  const [eventTagsHidden, setEventTagsHidden] = useState<string[]>(initialEventTypesHidden);

  const isResetButtonDisabled = useMemo(
    () =>
      isEqual([...columnsHidden].sort(), [...initialColumnsHidden].sort()) &&
      isEqual([...eventTagsHidden].sort(), [...initialEventTypesHidden].sort()),
    [columnsHidden, eventTagsHidden, initialColumnsHidden, initialEventTypesHidden],
  );

  const toggleColumnCheckbox = ({ target: { checked, value: selectedColumn } }: CheckboxChangeEvent) =>
    setColumnsHidden(
      checked ? columnsHidden.filter(column => column !== selectedColumn) : [...columnsHidden, selectedColumn],
    );

  const toggleEventTypeCheckbox = ({ target: { checked, value: selectedEventType } }: CheckboxChangeEvent) => {
    setEventTagsHidden(
      checked
        ? eventTagsHidden.filter(eventType => eventType !== selectedEventType)
        : [...eventTagsHidden, selectedEventType],
    );
  };

  const reset = () => {
    setColumnsHidden(initialColumnsHidden);
    setEventTagsHidden(initialEventTypesHidden);
  };

  const apply = () => {
    setInitialColumnsHidden(columnsHidden);
    setInitialEventTypesHidden(eventTagsHidden);
    closeDrawer();
  };

  return (
    <SettingsItem header="Show table columns" IconComponent={FilterOutlined}>
      <div style={{ marginBottom: 10 }}>
        <Text>Show columns</Text>
      </div>
      {AVAILABLE_COLUMNS.map(({ key, name }) => (
        <div key={key} style={{ marginBottom: 10 }}>
          <Checkbox value={key} checked={!columnsHidden.includes(key)} onChange={toggleColumnCheckbox}>
            {name}
          </Checkbox>
        </div>
      ))}
      <div style={{ marginBottom: 10 }}>
        <Text>Show event types</Text>
      </div>
      {eventTags.map(key => (
        <div key={key} style={{ marginBottom: 10 }}>
          <Checkbox value={key} checked={!eventTagsHidden.includes(key)} onChange={toggleEventTypeCheckbox}>
            {TAG_NAMES_MAP[key] ?? key ?? '[empty]'}
          </Checkbox>
        </div>
      ))}
      <Divider style={{ marginTop: 0, marginBottom: 10 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button type="link" onClick={reset} style={{ paddingLeft: 0 }} disabled={isResetButtonDisabled}>
          Reset
        </Button>
        <Button type="primary" onClick={apply}>
          OK
        </Button>
      </div>
    </SettingsItem>
  );
};

export default ShowTableColumns;
