import { Typography, Checkbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { useCallback } from 'react';
import { FilterOutlined } from '@ant-design/icons';
import { COLUMNS, CONFIGURABLE_COLUMNS } from '../../constants';
import SettingsItem from '@client/components/SettingsItem';

const { Text } = Typography;

const AVAILABLE_COLUMNS = COLUMNS.filter(column => CONFIGURABLE_COLUMNS.includes(column.key));

interface ShowTableColumnsProps {
  columnsHidden: string[];
  setColumnsHidden: (value: string[]) => void;
}

export function ShowTableColumns({ columnsHidden, setColumnsHidden }: ShowTableColumnsProps) {
  const toggleColumnCheckbox = useCallback(
    ({ target: { checked, value: selectedColumn } }: CheckboxChangeEvent) => {
      setColumnsHidden(
        checked ? columnsHidden.filter(column => column !== selectedColumn) : [...columnsHidden, selectedColumn],
      );
    },
    [columnsHidden, setColumnsHidden],
  );

  return (
    <SettingsItem header="Table columns" IconComponent={FilterOutlined}>
      <div style={{ marginBottom: 10 }}>
        <Text>Visible Columns</Text>
      </div>
      {AVAILABLE_COLUMNS.map(({ key, name }) => (
        <div key={key} style={{ marginBottom: 10 }}>
          <Checkbox
            value={key}
            checked={!columnsHidden.includes(key)}
            onChange={toggleColumnCheckbox}
            style={{ userSelect: 'none' }}
          >
            {name}
          </Checkbox>
        </div>
      ))}
    </SettingsItem>
  );
}

export default ShowTableColumns;
