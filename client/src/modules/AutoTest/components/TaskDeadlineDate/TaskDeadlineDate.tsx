import { Space, Typography } from 'antd';
import { CalendarOutlined, SwapRightOutlined } from '@ant-design/icons';
import React, { memo, useMemo } from 'react';
import { dateWithTimeZoneRenderer } from 'components/Table';
import { BaseType } from 'antd/lib/typography/Base';
import getStatusByDate, { AutoTestTaskStatus } from 'modules/AutoTest/utils/getStatusByDate';

const { Text } = Typography;

export type TaskDeadlineDateProps = {
  startDate: string;
  endDate: string;
  score?: number;
  format?: string;
};

function getTextType(endDate: string, score: number): BaseType {
  const status = getStatusByDate(endDate, score);

  switch (status) {
    case AutoTestTaskStatus.Missed:
      return 'danger';
    case AutoTestTaskStatus.DeadlineSoon:
      return 'warning';
    default:
      return 'secondary';
  }
}

function TaskDeadlineDate({ startDate, endDate, score = 0, format = 'MMM DD' }: TaskDeadlineDateProps): JSX.Element {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const type = useMemo(() => getTextType(endDate, score), [endDate, score]);

  const start = dateWithTimeZoneRenderer(timezone, format)(startDate);
  const end = dateWithTimeZoneRenderer(timezone, format)(endDate);

  return (
    <Space wrap style={{ justifyContent: 'end' }}>
      <Text type={type}>
        <CalendarOutlined />
      </Text>
      <Text type={type}>
        {start} <SwapRightOutlined /> {end}
      </Text>
    </Space>
  );
}

export default memo(TaskDeadlineDate);
