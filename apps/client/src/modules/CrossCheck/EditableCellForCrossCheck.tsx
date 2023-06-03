import { Form, InputNumber, Input } from 'antd';
import { CriteriaDto } from 'api';
import React from 'react';
import { TaskType } from './components/CrossCheckCriteriaForm';

const { TextArea } = Input;

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  inputType: 'max' | 'text' | 'description';
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

  const inputNode =
    inputType === 'description' ? (
      <TextArea rows={3} />
    ) : type !== TaskType.Title ? (
      <InputNumber style={{ width: 65 }} />
    ) : null;

  return (
    <td
      {...restProps}
      title={isPointsEqualZero ? 'Check points for this line' : ''}
      style={{ color: isPointsEqualZero ? 'red' : 'black' }}
    >
      {editing && inputType !== 'text' ? (
        <Form.Item name={dataIndex} style={{ margin: 0 }}>
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};
