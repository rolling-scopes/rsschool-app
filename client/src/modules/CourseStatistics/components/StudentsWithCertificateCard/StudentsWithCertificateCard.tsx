import { Card, Typography } from 'antd';
import { CourseStatsDto } from 'api';
import { Colors } from '../../data';
import { dynamicWithSkeleton } from '@client/utils/dynamicWithSkeleton';

type Props = {
  studentsStats: CourseStatsDto;
};

const { Text } = Typography;

const LiquidChart = dynamicWithSkeleton(() => import('../LiquidChart/LiquidChart'));

export const StudentsWithCertificateCard = ({ studentsStats }: Props) => {
  return (
    <Card title="Students With Certificate">
      <Text strong>
        Students With Certificate: {studentsStats.certifiedStudentsCount} / {studentsStats.activeStudentsCount}
      </Text>
      <div style={{ height: 180, width: '100%' }}>
        <LiquidChart
          count={studentsStats.certifiedStudentsCount}
          total={studentsStats.activeStudentsCount}
          color={Colors.Lime}
        />
      </div>
    </Card>
  );
};
