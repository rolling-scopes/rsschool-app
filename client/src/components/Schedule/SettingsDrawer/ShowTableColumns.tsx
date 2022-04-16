import React from 'react';
import { Button, Divider, Typography, Checkbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { FilterOutlined } from '@ant-design/icons';
import { TASK_TYPES_MAP } from 'data/taskTypes';
import { Column, CONFIGURABLE_COLUMNS } from '../constants';
import SettingsItem from './SettingsItem';

const { Text } = Typography;

const COLUMNS = Object.entries(Column).filter(([key]) => CONFIGURABLE_COLUMNS.includes(key));

interface ShowTableColumnsProps {
  eventTypes: string[];
  columnsHidden: string[];
  setColumnsHidden: (value: string[]) => void;
  eventTypesHidden: string[];
  setEventTypesHidden: (value: string[]) => void;
}

const ShowTableColumns: React.FC<ShowTableColumnsProps> = ({
  eventTypes,
  columnsHidden,
  setColumnsHidden,
  eventTypesHidden,
  setEventTypesHidden,
}) => {
  const toggleColumnCheckbox = ({ target: { checked, value: selectedColumn } }: CheckboxChangeEvent) =>
    setColumnsHidden(
      checked ? columnsHidden.filter(column => column !== selectedColumn) : [...columnsHidden, selectedColumn],
    );

  const toggleEventTypeCheckbox = ({ target: { checked, value: selectedEventType } }: CheckboxChangeEvent) => {
    setEventTypesHidden(
      checked
        ? eventTypesHidden.filter(eventType => eventType !== selectedEventType)
        : [...eventTypesHidden, selectedEventType],
    );
  };

  const reset = () => {
    setColumnsHidden([]);
    setEventTypesHidden([]);
  };

  return (
    <SettingsItem header="Show table columns" IconComponent={FilterOutlined}>
      <div style={{ marginBottom: 10 }}>
        <Text>Show columns</Text>
      </div>
      {COLUMNS.map(([key, name]) => (
        <div key={key} style={{ marginBottom: 10 }}>
          <Checkbox value={key} checked={!columnsHidden.includes(key)} onChange={toggleColumnCheckbox}>
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
            {TASK_TYPES_MAP[key] ?? key ?? '[empty]'}
          </Checkbox>
        </div>
      ))}
      <Divider style={{ marginTop: 0, marginBottom: 10 }} />
      <Button type="primary" onClick={reset}>
        Reset
      </Button>
    </SettingsItem>
  );
};

export default ShowTableColumns;
