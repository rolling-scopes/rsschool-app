import { Form } from 'antd';
import { CriteriaDto } from 'api';
import React from 'react';
import { EditableCriteriaInput } from './EditableCriteriaInput';
import { InputType, TaskType } from './constants';

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  inputType: InputType;
  record: CriteriaDto;
  index: number;
  children: React.ReactNode;
  type: TaskType;
  points: number | undefined;
}

export const EditableCellForCrossCheck: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  inputType,
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
          <EditableCriteriaInput inputType={inputType} type={type} />
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};
