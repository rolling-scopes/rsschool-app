import { Form, Input, InputNumber } from 'antd';
import { FC } from 'react';
import { CriteriaTypeSelect } from './CriteriaTypeSelect';
import { EditableTableColumnsDataIndex, TaskType } from './constants';
import { CriteriaDtoTypeEnum } from '@client/api';

interface EditableCriteriaInputProps {
  type?: CriteriaDtoTypeEnum;
  dataIndex: EditableTableColumnsDataIndex;
  onSelectChange: (value: string) => void;
}

export const EditableCriteriaInput: FC<EditableCriteriaInputProps> = ({ dataIndex, onSelectChange, type }) => {
  switch (dataIndex) {
    case EditableTableColumnsDataIndex.Max:
      return type !== TaskType.Title ? (
        <Form.Item name={dataIndex} style={{ margin: 0 }}>
          <InputNumber style={{ width: 65 }} />
        </Form.Item>
      ) : null;
    case EditableTableColumnsDataIndex.Type:
      return (
        <Form.Item name={dataIndex} style={{ margin: 0 }}>
          <CriteriaTypeSelect onChange={onSelectChange} />
        </Form.Item>
      );
    case EditableTableColumnsDataIndex.Text:
      return (
        <Form.Item name={dataIndex} style={{ margin: 0 }}>
          <Input.TextArea rows={3} />
        </Form.Item>
      );
    default:
      return null;
  }
};
