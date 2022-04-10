import React from 'react';
import { Select } from 'antd';
import { TIMEZONES } from 'configs/timezones';

const { Option } = Select;

interface TimezoneSelectProps {
  timezone: string;
  setTimezone: (value: string) => void;
}

const TimezoneSelect: React.FC<TimezoneSelectProps> = ({ timezone, setTimezone }) => (
  <Select style={{ width: 200 }} placeholder="Please select a timezone" defaultValue={timezone} onChange={setTimezone}>
    {TIMEZONES.map(timezone => (
      <Option key={timezone} value={timezone}>
        {/* there is no 'Europe / Kyiv' timezone at the moment */}
        {timezone === 'Europe/Kiev' ? 'Europe/Kyiv' : timezone}
      </Option>
    ))}
  </Select>
);

export default TimezoneSelect;
