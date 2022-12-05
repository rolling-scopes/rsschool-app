import { Space, Typography } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import React, { useMemo } from 'react';
import { dateWithTimeZoneRenderer } from 'components/Table';
import { BaseType } from 'antd/lib/typography/Base';
import getStatusByDate, { AutoTestTaskStatus } from 'modules/AutoTest/utils/getStatusByDate';

const { Text } = Typography;

type TaskDeadlineDateProps = {
  startDate: string;
  endDate: string;
  score?: number;
};

function getTextType(endDate: string, score: number): BaseType {
  const status = getStatusByDate(endDate, score);

  switch (status) {
    case AutoTestTaskStatus.Missed:
      return 'danger';
    default:
      return 'secondary';
  }
}

function TaskDeadlineDate({ startDate, endDate, score = 0 }: TaskDeadlineDateProps): JSX.Element {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const type = useMemo(() => getTextType(endDate, score), [endDate, score]);

  const start = dateWithTimeZoneRenderer(timezone, 'MMM DD')(startDate);
  const end = dateWithTimeZoneRenderer(timezone, 'MMM DD')(endDate);

  return (
    <Space wrap style={{ justifyContent: 'end' }}>
      <Text type={type}>
        <CalendarOutlined />
      </Text>
      <Text type={type}>
        {start} &ndash; {end}
      </Text>
    </Space>
  );
}

export default TaskDeadlineDate;
