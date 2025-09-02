import { Card } from 'antd';
import { CountriesStatsDto } from 'api';
import { Colors } from 'modules/CourseStatistics/data';
import { dynamicWithSkeleton } from '@client/utils/dynamicWithSkeleton';

type Props = {
  studentsCertificatesCountriesStats: CountriesStatsDto;
  certificatesCount: number;
};

const CountriesChart = dynamicWithSkeleton(() => import('../CountriesChart/CountriesChart'));

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
