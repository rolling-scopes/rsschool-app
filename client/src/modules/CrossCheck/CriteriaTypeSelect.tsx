import { Select } from 'antd';
import { TaskType } from './components/CrossCheckCriteriaForm';
import { FC } from 'react';
import { CrossCheckCriteriaType } from 'services/course';

const options = Object.keys(TaskType);

interface CriteriaTypeSelectProps {
  onChange?: (value: CrossCheckCriteriaType) => void;
}

export const CriteriaTypeSelect: FC<CriteriaTypeSelectProps> = ({ onChange }) => (
  <Select placeholder="Select type" onChange={onChange}>
    {options.map(option => (
      <Select.Option data-testid={option} value={option} key={option}>
        {option}
      </Select.Option>
    ))}
  </Select>
);
