import React from 'react';
import { Select } from 'antd';
import { TIMEZONES } from 'configs/timezones';

const { Option } = Select;

interface TimezoneSelectProps {
  timezone: string;
  setTimezone: (value: string) => void;
}

const TimezoneSelect: React.FC<TimezoneSelectProps> = ({
  timezone,
  setTimezone,
}) => (
  <Select
    style={{ width: 200 }}
    placeholder="Please select a timezone"
    defaultValue={timezone}
    onChange={setTimezone}
  >
    {TIMEZONES.map(tz => (
      <Option key={tz} value={tz}>
        {/* there is no 'Europe / Kyiv' time zone at the moment */}
        {tz === 'Europe/Kiev' ? 'Europe/Kyiv' : tz}
      </Option>
    ))}
  </Select>

);

export default TimezoneSelect;
