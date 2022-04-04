import React from 'react';
import { Button, Divider, Typography, Checkbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { FilterOutlined } from '@ant-design/icons';
import { TASK_TYPES_MAP } from 'data/taskTypes';
import { Column, CONFIGURABLE_COLUMNS } from 'components/Schedule/model';
import SettingsItem from './SettingsItem';

const { Text } = Typography;

const COLUMNS = Object.entries(Column).filter(([key]) => CONFIGURABLE_COLUMNS.includes(key));

interface ShowTableColumnsProps {
  eventTypes: string[];
  columnsShown: string[];
  setColumnsShown: (value: string[]) => void;
  eventTypesHidden: string[];
  setEventTypesHidden: (value: string[]) => void;
}

const ShowTableColumns: React.FC<ShowTableColumnsProps> = ({
  eventTypes,
  columnsShown,
  setColumnsShown,
  eventTypesHidden,
  setEventTypesHidden,
}) => {
  const toggleColumnCheckbox = (event: CheckboxChangeEvent) => {
    const selectedColumn = event.target.value;
    if (event.target.checked) {
      setColumnsShown([...columnsShown, selectedColumn]);
    } else {
      setColumnsShown(columnsShown.filter(column => column !== selectedColumn));
    }
  };

  const toggleEventTypeCheckbox = (event: CheckboxChangeEvent) => {
    const selectedEventType = event.target.value;
    if (!event.target.checked) {
      setEventTypesHidden([...eventTypesHidden, selectedEventType]);
    } else {
      setEventTypesHidden(eventTypesHidden.filter(eventType => eventType !== selectedEventType));
    }
  };

  const resetCheckboxes = () => {
    setColumnsShown(Object.keys(Column));
    setEventTypesHidden([]);
  };

  return (
    <SettingsItem header="Show table columns" IconComponent={FilterOutlined}>
      <div style={{ marginBottom: 10 }}>
        <Text>Show columns</Text>
      </div>
      {COLUMNS.map(([key, name]) => (
        <div key={key} style={{ marginBottom: 10 }}>
          <Checkbox value={key} checked={!!columnsShown.includes(key)} onChange={toggleColumnCheckbox}>
            {name}
          </Checkbox>
        </div>
      ))}
      <div style={{ marginBottom: 10 }}>
        <Text>Show event types</Text>
      </div>
      {eventTypes.map(key => (
        <div key={key} style={{ marginBottom: 10 }}>
          <Checkbox value={key} checked={!eventTypesHidden.includes(key)} onChange={toggleEventTypeCheckbox}>
            {TASK_TYPES_MAP[key] ?? key}
          </Checkbox>
        </div>
      ))}
      <Divider style={{ marginTop: 0, marginBottom: 10 }} />
      <Button type="primary" onClick={resetCheckboxes}>
        Reset
      </Button>
    </SettingsItem>
  );
};

export default ShowTableColumns;
