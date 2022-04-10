import React from 'react';
import { Typography, InputNumber } from 'antd';
import { PercentageOutlined } from '@ant-design/icons';
import SettingsItem from './SettingsItem';

const { Text } = Typography;

interface ChangeTagColorProps {
  limitForDoneTask: number;
  setLimitForDoneTask: (value: number) => void;
}

const TaskLimits: React.FC<ChangeTagColorProps> = ({ limitForDoneTask, setLimitForDoneTask }) => (
  <SettingsItem header="Task limits" IconComponent={PercentageOutlined}>
    <Text>Show limit for done tasks, %</Text>{' '}
    <InputNumber min={0} max={100} defaultValue={limitForDoneTask} onChange={setLimitForDoneTask} />
  </SettingsItem>
);

export default TaskLimits;
