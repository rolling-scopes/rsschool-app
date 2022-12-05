import { Space, Typography } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import React from 'react';
import moment from 'moment';
import { dateWithTimeZoneRenderer } from 'components/Table';
import { BaseType } from 'antd/lib/typography/Base';

const { Text } = Typography;

type TaskDeadlineDateProps = {
  startDate: string;
  endDate: string;
  score?: number;
};

function TaskDeadlineDate({ startDate, endDate, score = 0 }: TaskDeadlineDateProps): JSX.Element {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  function getTextType(): BaseType {
    const now = moment();
    const end = moment(endDate);

    const isDeadlineSoon = now <= end && end.diff(now, 'hours') < 48 && !score;
    const isDeadlineMissed = now >= end && !score;

    if (isDeadlineMissed) {
      return 'danger';
    }

    if (isDeadlineSoon) {
      return 'warning';
    }

    return 'secondary';
  }

  const start = dateWithTimeZoneRenderer(timezone, 'MMM DD')(startDate);
  const end = dateWithTimeZoneRenderer(timezone, 'MMM DD')(endDate);

  return (
    <Space wrap style={{ justifyContent: 'end' }}>
      <Text type={getTextType()}>
        <CalendarOutlined />
      </Text>
      <Text type={getTextType()}>
        {start} &ndash; {end}
      </Text>
    </Space>
  );
}

export default TaskDeadlineDate;
