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
