import { Card, Typography } from 'antd';
import { CourseStatsDto } from 'api';
import dynamic from 'next/dynamic';
import { Colors } from '../data';

type Props = {
  studentsStats: CourseStatsDto;
};

const { Text } = Typography;

const MentorsStatsChart = dynamic(() => import('../LiquidChart/LiquidChart'), { ssr: false });

export const StudentsWithCertificateCard = ({ studentsStats }: Props) => {
  return (
    <Card title="Students With Certificate">
      <Text strong>
        Students With Certificate: {studentsStats.studentsWithCertificateCount} / {studentsStats.studentsActiveCount}
      </Text>
      <div style={{ height: 180, width: '100%' }}>
        <MentorsStatsChart
          count={studentsStats.studentsWithCertificateCount}
          total={studentsStats.studentsActiveCount}
          color={Colors.Lime}
        />
      </div>
    </Card>
  );
};
