import { Select } from 'antd';
import { FC } from 'react';
import { CrossCheckCriteriaType } from 'services/course';
import { TaskType } from './constants';

const options = Object.entries(TaskType).map(([label, value]) => ({ label, value }));

interface CriteriaTypeSelectProps {
  onChange?: (value: CrossCheckCriteriaType) => void;
}

export const CriteriaTypeSelect: FC<CriteriaTypeSelectProps> = ({ onChange }) => (
  <Select placeholder="Select type" onChange={onChange}>
    {options.map(({ label, value }) => (
      <Select.Option data-testid={label} value={value} key={label}>
        {label}
      </Select.Option>
    ))}
  </Select>
);
