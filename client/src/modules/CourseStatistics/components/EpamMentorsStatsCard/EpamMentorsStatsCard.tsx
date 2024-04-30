import { Card, Typography } from 'antd';
import { CourseMentorsStatsDto } from 'api';
import dynamic from 'next/dynamic';
import { Colors } from '../../data';

type Props = {
  mentorsStats: CourseMentorsStatsDto;
};

const { Text } = Typography;

const LiquidChart = dynamic(() => import('../LiquidChart/LiquidChart'), { ssr: false });

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
