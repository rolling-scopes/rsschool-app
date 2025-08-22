import { Card, Skeleton, Typography } from 'antd';
import { CourseStatsDto } from 'api';
import dynamic from 'next/dynamic';
import { Colors } from '../../data';

type Props = {
  studentsStats: CourseStatsDto;
};

const { Text } = Typography;

const LiquidChart = dynamic(() => import('../LiquidChart/LiquidChart'), {
  ssr: false,
  loading: () => <Skeleton active={true} />,
});

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
