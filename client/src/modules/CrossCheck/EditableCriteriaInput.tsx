import { Input, InputNumber } from 'antd';
import { FC } from 'react';
import { CriteriaTypeSelect } from './CriteriaTypeSelect';
import { InputType } from './constants';
import { TaskType } from './components/CrossCheckCriteriaForm';

interface EditableCriteriaInputProps {
  inputType: InputType;
  type: TaskType;
}

export const EditableCriteriaInput: FC<EditableCriteriaInputProps> = ({ inputType, type }) => {
  if (type === TaskType.Title) {
    return null;
  }

  switch (inputType) {
    case InputType.Max:
      return <InputNumber style={{ width: 65 }} />;
    case InputType.Type:
      return <CriteriaTypeSelect />;
    case InputType.Description:
      return <Input.TextArea rows={3} />;
    default:
      return null;
  }
};
