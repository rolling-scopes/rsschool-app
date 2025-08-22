import { Card, Skeleton } from 'antd';
import { CountriesStatsDto } from 'api';
import dynamic from 'next/dynamic';

type Props = {
  studentsCountriesStats: CountriesStatsDto;
  activeStudentsCount: number;
};

const CountriesChart = dynamic(() => import('../CountriesChart/CountriesChart'), {
  ssr: false,
  loading: () => <Skeleton active={true} />,
});

export const StudentsCountriesCard = ({ studentsCountriesStats, activeStudentsCount }: Props) => {
  const { countries } = studentsCountriesStats;
  return (
    <Card title="Students Countries">
      <div style={{ height: 350, width: '100%' }}>
        <CountriesChart data={countries} activeCount={activeStudentsCount} xAxisTitle={'Number of Students'} />
      </div>
    </Card>
  );
};
