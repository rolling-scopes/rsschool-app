import { Card, Typography } from 'antd';
import { CourseStatsDto } from 'api';
import { Colors } from '../../data';
import { dynamicWithSkeleton } from '@client/utils/dynamicWithSkeleton';

type Props = {
  studentsStats: CourseStatsDto;
};

const { Text } = Typography;

const LiquidChart = dynamicWithSkeleton(() => import('../LiquidChart/LiquidChart'));

export const StudentsWithMentorsCard = ({ studentsStats }: Props) => {
  return (
    <Card title="Students With Mentor">
      <Text strong>
        Students With Mentor: {studentsStats.studentsWithMentorCount} / {studentsStats.activeStudentsCount}
      </Text>
      <div style={{ height: 180, width: '100%' }}>
        <LiquidChart
          count={studentsStats.studentsWithMentorCount}
          total={studentsStats.activeStudentsCount}
          color={Colors.Gold}
        />
      </div>
    </Card>
  );
};
