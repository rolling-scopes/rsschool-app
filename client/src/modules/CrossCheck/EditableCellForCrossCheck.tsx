import { Form, InputNumber, Input, Select } from 'antd';
import { CriteriaDto } from 'api';
import React from 'react';

const { TextArea } = Input;

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'max' | 'text' | 'description';
  record: CriteriaDto;
  index: number;
  children: React.ReactNode;
}

export const EditableCellForCrossCheck: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  inputType,
  children,
  ...restProps
}) => {
  const inputNode =
    inputType === 'max' ? (
      <InputNumber style={{ width: 65 }} />
    ) : inputType === 'text' ? (
      <Select style={{ width: 75 }}>
        <Select.Option value="Title">Title</Select.Option>
        <Select.Option value="Subtask">Subtask</Select.Option>
        <Select.Option value="Penalty">Penalty</Select.Option>
      </Select>
    ) : (
      <TextArea rows={3} />
    );

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item name={dataIndex} style={{ margin: 0 }}>
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};
