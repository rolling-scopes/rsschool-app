import { Pie, PieConfig } from '@ant-design/plots';

type Props = {
  data: {
    type: string;
    value: number;
  }[];
  config?: Partial<PieConfig>;
};

const DonutChart = ({ data, config = {} }: Props) => {
  const pieConfig: PieConfig = {
    ...config,
    data,
    angleField: 'value',
    colorField: 'type',
    innerRadius: 0.6,
    label: {
      content: '',
    },
    legend: {
      color: {
        title: false,
        position: 'right',
        rowPadding: 5,
      },
    },
  };
  return <Pie {...pieConfig} />;
};

export default DonutChart;
