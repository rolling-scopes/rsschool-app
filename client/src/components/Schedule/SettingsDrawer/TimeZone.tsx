import React from 'react';
import { Typography, Divider, Select } from 'antd';
import { PercentageOutlined } from '@ant-design/icons';
import SettingsItem from './SettingsItem';
import { TIMEZONES } from 'configs/timezones';

const { Paragraph, Title } = Typography;
const { Option } = Select;

interface TimeZoneProps {
  timezone: string;
  setTimezone: (value: string) => void;
  firstDayOfTheWeek: number;
  setFirstDayOfTheWeek: (value: number) => void;
}

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TimeZone: React.FC<TimeZoneProps> = ({ timezone, setTimezone, firstDayOfTheWeek, setFirstDayOfTheWeek }) => (
  <SettingsItem header="Time zone and calendar week" IconComponent={PercentageOutlined}>
    <Title level={5}>Time zone</Title>
    <Paragraph>Manage region-specific options for the schedule.</Paragraph>
    <Select
      style={{ width: 200 }}
      placeholder="Please select a timezone"
      defaultValue={timezone}
      onChange={setTimezone}
    >
      {TIMEZONES.map(timezone => (
        <Option key={timezone} value={timezone}>
          {/* there is no 'Europe / Kyiv' timezone at the moment */}
          {timezone === 'Europe/Kiev' ? 'Europe/Kyiv' : timezone}
        </Option>
      ))}
    </Select>
    <Divider style={{ marginBottom: 16 }} />
    <Title level={5}>First day of the week</Title>
    <Paragraph>Select the day when your calendar week begins.</Paragraph>
    <Select
      style={{ width: 200 }}
      placeholder="Please select a day"
      defaultValue={firstDayOfTheWeek}
      onChange={setFirstDayOfTheWeek}
    >
      {weekdays.map((day, index) => (
        <Option key={index} value={index}>
          {day}
        </Option>
      ))}
    </Select>
  </SettingsItem>
);

export default TimeZone;
