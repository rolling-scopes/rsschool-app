import { DatePicker, DatePickerProps, Flex, Space, Switch, SwitchProps } from 'antd';
import { StatScope } from '@client/modules/CourseStatistics/entities';

type StatScopeSelectorProps = {
  statScope: StatScope;
  handleYearSelection: DatePickerProps['onChange'];
  handleStatScope: SwitchProps['onChange'];
};

export function StatScopeSelector({ statScope, handleYearSelection, handleStatScope }: StatScopeSelectorProps) {
  return (
    <Flex
      wrap={'wrap'}
      justify="space-between"
      align="center"
      gap="1rem"
      style={{ paddingBottom: '1rem', minHeight: '3rem' }}
    >
      <Space>
        {statScope === StatScope.Timeline && (
          <DatePicker allowClear={false} onChange={handleYearSelection} picker="year" />
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
