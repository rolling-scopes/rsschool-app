import { Card, Typography } from 'antd';
import { CourseStatsDto } from '@client/api';
import { Colors } from '../../data';
import { dynamicWithSkeleton } from '@client/utils/dynamicWithSkeleton';

type Props = {
  studentsStats: CourseStatsDto;
};

const { Text } = Typography;

const LiquidChart = dynamicWithSkeleton(() => import('../LiquidChart/LiquidChart'));

export const StudentsEligibleForCertificationCard = ({ studentsStats }: Props) => {
  return (
    <Card title="Eligible for Certification">
      <Text strong>
        Eligible for Certification: {studentsStats.eligibleForCertificationCount} / {studentsStats.activeStudentsCount}
      </Text>
      <div style={{ height: 180, width: '100%' }}>
        <LiquidChart
          count={studentsStats.eligibleForCertificationCount}
          total={studentsStats.activeStudentsCount}
          color={Colors.Lime}
        />
      </div>
    </Card>
  );
};
