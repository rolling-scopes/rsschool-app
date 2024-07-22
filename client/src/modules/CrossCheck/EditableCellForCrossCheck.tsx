import { Form } from 'antd';
import { CriteriaDto } from 'api';
import React from 'react';
import { EditableCriteriaInput } from './EditableCriteriaInput';
import { EditableTableColumnsDataIndex } from './constants';

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: EditableTableColumnsDataIndex;
  record: CriteriaDto;
  index: number;
  children: React.ReactNode;
  onSelectChange: (value: string) => void;
}

export const EditableCellForCrossCheck: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  children,
  record,
  onSelectChange,
  ...props
}) => {
  const hasMax = record?.max !== 0;

  return (
    <td {...props} title={hasMax ? '' : 'Check points for this line'} style={{ color: hasMax ? 'black' : 'red' }}>
      {editing ? (
        <Form.Item name={[record.key, dataIndex]} style={{ margin: 0 }}>
          <EditableCriteriaInput dataIndex={dataIndex} onSelectChange={onSelectChange} type={record?.type} />
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};
