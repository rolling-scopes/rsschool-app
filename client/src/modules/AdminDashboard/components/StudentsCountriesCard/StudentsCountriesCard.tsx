import { Card } from 'antd';
import { StudentsCountriesStatsDto } from 'api';
import dynamic from 'next/dynamic';

type Props = {
  studentsCountriesStats: StudentsCountriesStatsDto;
};

const StudentsCountriesChart = dynamic(() => import('./StudentsCountriesChart'), { ssr: false });

export const StudentsCountriesCard = ({ studentsCountriesStats }: Props) => {
  const { countries, studentsActiveCount } = studentsCountriesStats;
  return (
    <Card title="Students Countries Stats">
      <div style={{ height: 400, width: '100%' }}>
        <StudentsCountriesChart data={countries} studentsActiveCount={studentsActiveCount} />
      </div>
    </Card>
  );
};
