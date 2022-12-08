import { CalendarOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import { formatDate } from 'services/formatter';

export function InterviewPeriod(props: { startDate: string; endDate: string }) {
  const { startDate, endDate } = props;
  return (
    <div className="interview-period">
      <Typography.Text type="secondary">
        <CalendarOutlined style={{ marginRight: 8 }} />
        {formatDate(startDate)} - {formatDate(endDate)}
      </Typography.Text>
    </div>
  );
}
