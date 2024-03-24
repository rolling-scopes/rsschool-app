import { Card, Typography } from 'antd';
import { CourseStatsDto } from 'api';
import dynamic from 'next/dynamic';

type Props = {
  studentsStats: CourseStatsDto;
};

const { Text } = Typography;

const StudentsStatsChart = dynamic(() => import('../LiquidChart/LiquidChart'), { ssr: false });

export const StudentsStatsCard = ({ studentsStats }: Props) => {
  return (
    <Card title="Active Students">
      <Text strong>
        Active Students: {studentsStats.activeStudentsCount} / {studentsStats.totalStudents}
      </Text>
      <div style={{ height: 180, width: '100%' }}>
        <StudentsStatsChart count={studentsStats.activeStudentsCount} total={studentsStats.totalStudents} />
      </div>
    </Card>
  );
};
