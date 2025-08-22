import { Card, Skeleton } from 'antd';
import { CountriesStatsDto } from 'api';
import { Colors } from 'modules/CourseStatistics/data';
import dynamic from 'next/dynamic';

type Props = {
  studentsCertificatesCountriesStats: CountriesStatsDto;
  certificatesCount: number;
};

const CountriesChart = dynamic(() => import('../CountriesChart/CountriesChart'), {
  ssr: false,
  loading: () => <Skeleton active={true} />,
});

export const StudentsCertificatesCountriesCard = ({ studentsCertificatesCountriesStats, certificatesCount }: Props) => {
  const { countries } = studentsCertificatesCountriesStats;
  return (
    <Card title="Certificates Countries">
      <div style={{ height: 350, width: '100%' }}>
        <CountriesChart
          data={countries}
          activeCount={certificatesCount}
          xAxisTitle={'Number of Certificates'}
          color={Colors.Lime}
        />
      </div>
    </Card>
  );
};
