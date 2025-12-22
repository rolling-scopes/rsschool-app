import { Card } from 'antd';
import { CountriesStatsDto } from '@client/api';
import { Colors } from '../../data';
import { dynamicWithSkeleton } from '@client/utils/dynamicWithSkeleton';

type Props = {
  countriesStats: CountriesStatsDto;
  activeCount: number;
};

const CountriesChart = dynamicWithSkeleton(() => import('../CountriesChart/CountriesChart'));

export const MentorsCountriesCard = ({ countriesStats, activeCount }: Props) => {
  const { countries } = countriesStats;
  return (
    <Card title="Mentors Countries">
      <div style={{ height: 350, width: '100%' }}>
        <CountriesChart
          data={countries}
          activeCount={activeCount}
          xAxisTitle={'Number of Mentors'}
          color={Colors.Purple}
        />
      </div>
    </Card>
  );
};
