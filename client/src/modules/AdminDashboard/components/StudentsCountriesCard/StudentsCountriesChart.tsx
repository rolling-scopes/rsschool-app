import { Bar, BarConfig } from '@ant-design/plots';
import { CountryStatDto } from 'api';

type Props = {
  data: CountryStatDto[];
  studentsActiveCount: number;
};

function StudentsCountriesChart({ data, studentsActiveCount }: Props) {
  const config: BarConfig = {
    data,
    yField: 'country',
    xField: 'studentsCount',
    yAxis: {
      label: {
        autoRotate: false,
      },
    },
    tooltip: {
      formatter: datum => {
        return {
          name: 'student count',
          value: `${datum.studentsCount} (${Math.ceil((datum.studentsCount / studentsActiveCount) * 100)}%)`,
        };
      },
    },
    xAxis: {
      title: {
        text: 'Students Count',
      },
    },
    scrollbar: {
      type: 'vertical',
    },
  };

  return <Bar {...config} />;
}

export default StudentsCountriesChart;
