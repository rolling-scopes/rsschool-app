import { ClockCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { formatDateTime } from 'services/formatter';
import { Group, GroupType } from 'components/Forms/CourseTaskSelect';

enum Color {
  Default = '#000',
  Green = '#52C41A',
  Orange = '#FAAD14',
  Red = '#FF4D4F',
}

type Props = {
  group: GroupType;
  endDate: string | null;
};

export function DeadlineIcon({ group, endDate }: Props) {
  const date = formatDateTime(endDate ?? '');
  const title = `${group === Group.CrossCheckDeadline ? `Cross-Check Deadline` : 'Deadline'}: ${date}`;
  const color = getColor(endDate);

  return (
    <Tooltip title={title} placement="topRight">
      <ClockCircleOutlined style={{ fontSize: '14px', color }} />
    </Tooltip>
  );
}

function getColor(endDate: string | null) {
  if (!endDate) {
    return Color.Default;
  }

  const endDateMilliseconds = Date.parse(endDate);
  const currentDate = new Date();
  const tomorrowDate = currentDate.setDate(currentDate.getDate() + 1);
  const dayAfterTomorrowDate = currentDate.setDate(currentDate.getDate() + 1);

  if (tomorrowDate >= endDateMilliseconds) {
    return Color.Red;
  }
  if (dayAfterTomorrowDate >= endDateMilliseconds) {
    return Color.Orange;
  }
  return Color.Green;
}
