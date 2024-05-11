import { Card } from 'antd';
import { CountriesStatsDto } from 'api';
import dynamic from 'next/dynamic';
import { Colors } from '../../data';

type Props = {
  countriesStats: CountriesStatsDto;
  activeCount: number;
};

const CountriesChart = dynamic(() => import('../CountriesChart/CountriesChart'), {
  ssr: false,
});

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
