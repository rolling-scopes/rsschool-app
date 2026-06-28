import { CalendarOutlined, SwapRightOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import { dateRenderer } from '@client/shared/components/Table';

type Props = {
  startDate: string;
  endDate: string;
};

const { Text } = Typography;

export function DistributionPeriod({ startDate, endDate }: Props) {
  return (
    <Text type="secondary" style={{ fontSize: 14 }}>
      <CalendarOutlined style={{ marginRight: 8 }} />
      {dateRenderer(startDate)} <SwapRightOutlined /> {dateRenderer(endDate)}
    </Text>
  );
}
