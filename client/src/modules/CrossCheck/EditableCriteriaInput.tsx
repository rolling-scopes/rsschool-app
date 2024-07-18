import { Input, InputNumber } from 'antd';
import { FC } from 'react';
import { CriteriaTypeSelect } from './CriteriaTypeSelect';
import { InputType, TaskType } from './constants';

interface EditableCriteriaInputProps {
  inputType: InputType;
  type: TaskType;
}

export const EditableCriteriaInput: FC<EditableCriteriaInputProps> = ({ inputType, type }) => {
  switch (inputType) {
    case InputType.Max:
      return type !== TaskType.Title ? <InputNumber style={{ width: 65 }} /> : null;
    case InputType.Text:
      return <CriteriaTypeSelect defaultValue={type} />;
    case InputType.Description:
      return <Input.TextArea rows={3} />;
    default:
      return null;
  }
};
