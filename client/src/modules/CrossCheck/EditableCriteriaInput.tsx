import { Input, InputNumber } from 'antd';
import { FC } from 'react';
import { CriteriaTypeSelect } from './CriteriaTypeSelect';
import { EditableTableColumnsDataIndex, TaskType } from './constants';
import { CriteriaDtoTypeEnum } from 'api';

interface EditableCriteriaInputProps {
  type?: CriteriaDtoTypeEnum;
  dataIndex: EditableTableColumnsDataIndex;
  onSelectChange: (value: string) => void;
}

export const EditableCriteriaInput: FC<EditableCriteriaInputProps> = ({ dataIndex, onSelectChange, type }) => {
  switch (dataIndex) {
    case EditableTableColumnsDataIndex.Max:
      return type !== TaskType.Title ? <InputNumber style={{ width: 65 }} /> : null;
    case EditableTableColumnsDataIndex.Type:
      return <CriteriaTypeSelect onChange={onSelectChange} />;
    case EditableTableColumnsDataIndex.Text:
      return <Input.TextArea rows={3} />;
    default:
      return null;
  }
};
