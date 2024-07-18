import { Input, InputNumber } from 'antd';
import { FC } from 'react';
import { CriteriaTypeSelect } from './CriteriaTypeSelect';
import { EditableCrossCheckTableColumnsDataIndex, TaskType } from './constants';

interface EditableCriteriaInputProps {
  dataIndex: EditableCrossCheckTableColumnsDataIndex;
  type: TaskType;
}

export const EditableCriteriaInput: FC<EditableCriteriaInputProps> = ({ dataIndex, type }) => {
  switch (dataIndex) {
    case EditableCrossCheckTableColumnsDataIndex.Max:
      return type !== TaskType.Title ? <InputNumber style={{ width: 65 }} /> : null;
    case EditableCrossCheckTableColumnsDataIndex.Type:
      return <CriteriaTypeSelect defaultValue={type} />;
    case EditableCrossCheckTableColumnsDataIndex.Text:
      return <Input.TextArea rows={3} />;
    default:
      return null;
  }
};
