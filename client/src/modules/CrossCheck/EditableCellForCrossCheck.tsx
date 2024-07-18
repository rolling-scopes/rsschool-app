import { Form } from 'antd';
import { CriteriaDto } from 'api';
import React from 'react';
import { EditableCriteriaInput } from './EditableCriteriaInput';
import { EditableCrossCheckTableColumnsDataIndex, TaskType } from './constants';

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: EditableCrossCheckTableColumnsDataIndex;
  record: CriteriaDto;
  index: number;
  children: React.ReactNode;
  type: TaskType;
  points: number | undefined;
}

export const EditableCellForCrossCheck: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  children,
  type,
  points,
  ...restProps
}) => {
  const isPointsEqualZero = points === 0;

  return (
    <td
      {...restProps}
      title={isPointsEqualZero ? 'Check points for this line' : ''}
      style={{ color: isPointsEqualZero ? 'red' : 'black' }}
    >
      {editing ? (
        <Form.Item name={dataIndex} style={{ margin: 0 }}>
          <EditableCriteriaInput dataIndex={dataIndex} type={type} />
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};
