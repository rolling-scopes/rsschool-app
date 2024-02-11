import { Card, Typography } from 'antd';
import { CourseMentorsStatsDto } from 'api';
import dynamic from 'next/dynamic';

type Props = {
  mentorsStats: CourseMentorsStatsDto;
};

const { Text } = Typography;

const MentorsStatsChart = dynamic(() => import('../LiquidChart/LiquidChart'), { ssr: false });

export const EpamMentorsStatsCard = ({ mentorsStats }: Props) => {
  return (
    <Card title="Epam Mentors">
      <Text strong>
        Epam Mentors: {mentorsStats.epamMentorsCount} / {mentorsStats.mentorsActiveCount}
      </Text>
      <div style={{ height: 200, width: '100%' }}>
        <MentorsStatsChart
          count={mentorsStats.epamMentorsCount}
          total={mentorsStats.mentorsActiveCount}
          color="purple"
        />
      </div>
    </Card>
  );
};
