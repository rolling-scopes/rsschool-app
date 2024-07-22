import { Input, InputNumber } from 'antd';
import { FC } from 'react';
import { CriteriaTypeSelect } from './CriteriaTypeSelect';
import { EditableTableColumnsDataIndex, TaskType } from './constants';
import { CriteriaDto } from 'api';

interface EditableCriteriaInputProps {
  record?: CriteriaDto;
  dataIndex: EditableTableColumnsDataIndex;
  onSelectChange: (value: string) => void;
}

export const EditableCriteriaInput: FC<EditableCriteriaInputProps> = ({ dataIndex, onSelectChange, record }) => {
  if (!record) {
    return null;
  }

  switch (dataIndex) {
    case EditableTableColumnsDataIndex.Max:
      return record.type !== TaskType.Title ? <InputNumber style={{ width: 65 }} defaultValue={record.max} /> : null;
    case EditableTableColumnsDataIndex.Type:
      return <CriteriaTypeSelect defaultValue={record.type} onChange={onSelectChange} />;
    case EditableTableColumnsDataIndex.Text:
      return <Input.TextArea rows={3} defaultValue={record.text} />;
    default:
      return null;
  }
};
