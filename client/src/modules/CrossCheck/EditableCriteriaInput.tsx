import { Input, InputNumber } from 'antd';
import { FC } from 'react';
import { CriteriaTypeSelect } from './CriteriaTypeSelect';
import { EditableTableColumnsDataIndex, TaskType } from './constants';

interface EditableCriteriaInputProps {
  dataIndex: EditableTableColumnsDataIndex;
  type: TaskType;
  onSelectChange: (value: string) => void;
}

export const EditableCriteriaInput: FC<EditableCriteriaInputProps> = ({ dataIndex, type, onSelectChange }) => {
  switch (dataIndex) {
    case EditableTableColumnsDataIndex.Max:
      return type !== TaskType.Title ? <InputNumber style={{ width: 65 }} /> : null;
    case EditableTableColumnsDataIndex.Type:
      return <CriteriaTypeSelect defaultValue={type} onChange={onSelectChange}/>;
    case EditableTableColumnsDataIndex.Text:
      return <Input.TextArea rows={3} />;
    default:
      return null;
  }
};
