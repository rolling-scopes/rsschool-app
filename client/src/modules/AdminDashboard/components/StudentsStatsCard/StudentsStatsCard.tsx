import { Card } from 'antd';
import { CourseStatsDto } from 'api';
import dynamic from 'next/dynamic';

type Props = {
  studentsStats: CourseStatsDto;
};

const StudentsStatsChart = dynamic(() => import('./StudentsStatsChart'), { ssr: false });

export const StudentsStatsCard = ({ studentsStats }: Props) => {
  return (
    <Card title="Active Students Stats">
      <div style={{ height: 200, width: '100%' }}>
        <StudentsStatsChart studentsStats={studentsStats} />
      </div>
    </Card>
  );
};
