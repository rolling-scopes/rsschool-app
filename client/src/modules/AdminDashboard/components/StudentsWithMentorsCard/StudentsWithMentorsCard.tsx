import { Card, Typography } from 'antd';
import { CourseStatsDto } from 'api';
import dynamic from 'next/dynamic';
import { Colors } from '../data';

type Props = {
  studentsStats: CourseStatsDto;
};

const { Text } = Typography;

const MentorsStatsChart = dynamic(() => import('../LiquidChart/LiquidChart'), { ssr: false });

export const StudentsWithMentorsCard = ({ studentsStats }: Props) => {
  return (
    <Card title="Students With Mentor">
      <Text strong>
        Students With Mentor: {studentsStats.studentsWithMentorCount} / {studentsStats.totalStudents}
      </Text>
      <div style={{ height: 180, width: '100%' }}>
        <MentorsStatsChart
          count={studentsStats.studentsWithMentorCount}
          total={studentsStats.totalStudents}
          color={Colors.Gold}
        />
      </div>
    </Card>
  );
};
