import { Input, InputNumber } from 'antd';
import { FC } from 'react';
import { CriteriaTypeSelect } from './CriteriaTypeSelect';
import { EditableCrossCheckTableColumnsDataIndex, TaskType } from './constants';

interface EditableCriteriaInputProps {
  dataIndex: EditableCrossCheckTableColumnsDataIndex;
  type: TaskType;
  onSelectChange: (value: string) => void;
}

export const EditableCriteriaInput: FC<EditableCriteriaInputProps> = ({ dataIndex, type, onSelectChange }) => {
  switch (dataIndex) {
    case EditableCrossCheckTableColumnsDataIndex.Max:
      return type !== TaskType.Title ? <InputNumber style={{ width: 65 }} /> : null;
    case EditableCrossCheckTableColumnsDataIndex.Type:
      return <CriteriaTypeSelect defaultValue={type} onChange={onSelectChange}/>;
    case EditableCrossCheckTableColumnsDataIndex.Text:
      return <Input.TextArea rows={3} />;
    default:
      return null;
  }
};
