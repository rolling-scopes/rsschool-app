import { Card } from 'antd';
import { CountriesStatsDto } from 'api';
import dynamic from 'next/dynamic';

type Props = {
  countriesStats: CountriesStatsDto;
  activeCount: number;
};

const CountriesChart = dynamic(() => import('../CountriesChart/CountriesChart'), { ssr: false });

export const MentorsCountriesCard = ({ countriesStats, activeCount }: Props) => {
  const { countries } = countriesStats;
  return (
    <Card title="Mentors Countries Stats">
      <div style={{ height: 400, width: '100%' }}>
        <CountriesChart data={countries} activeCount={activeCount} xAxisTitle={'Number of Students'} color={'Purple'} />
      </div>
    </Card>
  );
};
