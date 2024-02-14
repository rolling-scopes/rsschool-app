import { Card } from 'antd';
import { CountriesStatsDto } from 'api';
import dynamic from 'next/dynamic';

type Props = {
  studentsCountriesStats: CountriesStatsDto;
  studentsActiveCount: number;
};

const CountriesChart = dynamic(() => import('../CountriesChart/CountriesChart'), { ssr: false });

export const StudentsCountriesCard = ({ studentsCountriesStats, studentsActiveCount }: Props) => {
  const { countries } = studentsCountriesStats;
  return (
    <Card title="Students Countries">
      <div style={{ height: 350, width: '100%' }}>
        <CountriesChart data={countries} activeCount={studentsActiveCount} xAxisTitle={'Number of Students'} />
      </div>
    </Card>
  );
};
