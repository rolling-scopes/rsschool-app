import { DatePicker, DatePickerProps, Flex, Space, Switch, SwitchProps } from 'antd';
import { StatScope } from '@client/modules/CourseStatistics/constants';
import dayjs from 'dayjs';

type StatScopeSelectorProps = {
  statScope: StatScope;
  handleYearSelection: DatePickerProps['onChange'];
  handleStatScope: SwitchProps['onChange'];
  selectedYear?: number;
};

export function StatScopeSelector({
  statScope,
  handleYearSelection,
  handleStatScope,
  selectedYear,
}: StatScopeSelectorProps) {
  const date = selectedYear ? dayjs(String(selectedYear)) : dayjs(new Date());
  return (
    <Flex
      wrap="wrap"
      justify="space-between"
      align="center"
      gap="1rem"
      style={{ paddingBottom: '1rem', minHeight: '3rem' }}
    >
      <Space>
        {statScope === StatScope.Timeline && (
          <DatePicker allowClear={false} onChange={handleYearSelection} picker="year" defaultValue={date} />
        )}
      </Space>
      <Switch
        checkedChildren="Current"
        unCheckedChildren="Timeline"
        checked={statScope === StatScope.Current}
        onChange={handleStatScope}
      />
    </Flex>
  );
}
