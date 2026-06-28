import { Card, Typography } from 'antd';
import { CourseMentorsStatsDto } from '@client/api';
import { Colors } from '../../data';
import { dynamicWithSkeleton } from '@client/utils/dynamicWithSkeleton';

type Props = {
  mentorsStats: CourseMentorsStatsDto;
};

const { Text } = Typography;

const LiquidChart = dynamicWithSkeleton(() => import('../LiquidChart/LiquidChart'));

export const EpamMentorsStatsCard = ({ mentorsStats }: Props) => {
  return (
    <Card title="Epam Mentors">
      <Text strong>
        Epam Mentors: {mentorsStats.epamMentorsCount} / {mentorsStats.mentorsActiveCount}
      </Text>
      <div style={{ height: 180, width: '100%' }}>
        <LiquidChart
          count={mentorsStats.epamMentorsCount}
          total={mentorsStats.mentorsActiveCount}
          color={Colors.Purple}
        />
      </div>
    </Card>
  );
};
