import { Space, Typography } from 'antd';
import { CalendarOutlined, SwapRightOutlined } from '@ant-design/icons';
import React, { memo, useMemo } from 'react';
import { dateWithTimeZoneRenderer } from 'components/Table';
import { BaseType } from 'antd/lib/typography/Base';
import { CourseTaskState } from '../../types';

const { Text } = Typography;

export type TaskDeadlineDateProps = {
  startDate: string;
  endDate: string;
  state: CourseTaskState;
  format?: string;
};

function getTextType(state: CourseTaskState): BaseType {
  switch (state) {
    case CourseTaskState.Missed:
      return 'danger';
    default:
      return 'secondary';
  }
}

function TaskDeadlineDate({ startDate, endDate, state, format = 'MMM DD' }: TaskDeadlineDateProps): JSX.Element {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const type = useMemo(() => getTextType(state), [state]);

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
