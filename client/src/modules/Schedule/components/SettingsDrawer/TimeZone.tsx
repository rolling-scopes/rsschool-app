import React from 'react';
import { Typography, Select } from 'antd';
import { FieldTimeOutlined } from '@ant-design/icons';
import { ALL_TIMEZONES } from 'configs/timezones';
import SettingsItem from '@client/components/SettingsItem';

const { Paragraph, Title } = Typography;
const { Option } = Select;

interface TimeZoneProps {
  timezone: string;
  setTimezone: (value: string) => void;
}

export function TimeZone({ timezone, setTimezone }: TimeZoneProps) {
  return (
    <SettingsItem header="Time zone" IconComponent={FieldTimeOutlined}>
      <Title level={5}>Time zone</Title>
      <Paragraph>Manage region-specific options for the schedule.</Paragraph>
      <Select
        style={{ width: 200 }}
        placeholder="Please select a timezone"
        filterOption={(input: string, option) => (option?.value as string)?.toLowerCase().includes(input.toLowerCase())}
        defaultValue={timezone}
        onChange={setTimezone}
        showSearch
      >
        {ALL_TIMEZONES.map(timezone => (
          <Option key={timezone} value={timezone}>
            {/* there is no 'Europe / Kyiv' timezone at the moment */}
            {timezone === 'Europe/Kiev' ? 'Europe/Kyiv' : timezone}
          </Option>
        ))}
      </Select>
    </SettingsItem>
  );
}

export default TimeZone;
