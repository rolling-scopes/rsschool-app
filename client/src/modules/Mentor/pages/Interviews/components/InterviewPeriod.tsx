import { CalendarOutlined } from '@ant-design/icons';
import { formatDate } from 'services/formatter';

export function InterviewPeriod(props: { startDate: string; endDate: string }) {
  const { startDate, endDate } = props;
  return (
    <div className="interview-period">
      <CalendarOutlined style={{ color: '#8C8C8C' }} />
      <span>
        {formatDate(startDate)} - {formatDate(endDate)}{' '}
      </span>
      <style jsx>{`
        .interview-period {
          color: #8c8c8c;
        }
        span {
          margin-left: 12px;
        }
      `}</style>
    </div>
  );
}
