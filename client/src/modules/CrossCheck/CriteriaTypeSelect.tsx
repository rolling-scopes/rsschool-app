import { Select } from 'antd';
import { FC } from 'react';
import { TaskType } from './constants';
import { SelectProps } from 'antd/lib';

const options = Object.entries(TaskType).map(([label, value]) => ({ label, value }));

interface CriteriaTypeSelectProps extends SelectProps {}

export const CriteriaTypeSelect: FC<CriteriaTypeSelectProps> = props => (
  <Select placeholder="Select type" {...props}>
    {options.map(({ label, value }) => (
      <Select.Option data-testid={label} value={value} key={label}>
        {label}
      </Select.Option>
    ))}
  </Select>
);
