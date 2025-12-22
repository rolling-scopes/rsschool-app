import { Card } from 'antd';
import { CountriesStatsDto } from '@client/api';
import { dynamicWithSkeleton } from '@client/utils/dynamicWithSkeleton';

type Props = {
  studentsCountriesStats: CountriesStatsDto;
  activeStudentsCount: number;
};

const CountriesChart = dynamicWithSkeleton(() => import('../CountriesChart/CountriesChart'));

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
