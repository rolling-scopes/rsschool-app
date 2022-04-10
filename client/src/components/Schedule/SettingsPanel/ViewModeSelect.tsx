import React from 'react';
import { Select } from 'antd';
import { ViewMode } from 'components/Schedule/constants';

const { Option } = Select;

interface ScheduleViewModeSelectProps {
  viewMode: ViewMode;
  setViewMode: (value: ViewMode) => void;
}

const ScheduleViewSelect: React.FC<ScheduleViewModeSelectProps> = ({
  viewMode,
  setViewMode,
}) => (
  <Select style={{ width: 100 }} defaultValue={viewMode} onChange={setViewMode}>
    <Option value={ViewMode.Table}>Table</Option>
    <Option value={ViewMode.List}>List</Option>
    <Option value={ViewMode.Calendar}>Calendar</Option>
  </Select>
);

export default ScheduleViewSelect;
