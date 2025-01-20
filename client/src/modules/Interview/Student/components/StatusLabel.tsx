import { Tag } from 'antd';
import { InterviewStatus } from 'domain/interview';

export const StatusLabel = ({ status }: { status: InterviewStatus }) => {
  const statusMap = {
    [InterviewStatus.Completed]: { color: 'green', label: 'Completed' },
    [InterviewStatus.Canceled]: { color: 'red', label: 'Canceled' },
    [InterviewStatus.NotCompleted]: { color: 'orange', label: 'Not Completed' },
  };
  const { color, label } = statusMap[status] || statusMap[InterviewStatus.NotCompleted];

  return <Tag color={color}>{label}</Tag>;
};
