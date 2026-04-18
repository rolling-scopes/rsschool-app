import { Pie, PieConfig } from '@ant-design/plots';
import { theme } from 'antd';
import { useTheme } from '@client/shared/hooks/useTheme';

type Props = {
  data: {
    type: string;
    value: number;
  }[];
  config?: Partial<PieConfig>;
};

const DonutChart = ({ data, config = {} }: Props) => {
  const { token } = theme.useToken();
  const { theme: currentTheme } = useTheme();
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  const pieConfig: PieConfig = {
    ...config,
    data,
    angleField: 'value',
    colorField: 'type',
    innerRadius: 0.6,
    label: false,
    theme: currentTheme,
    legend: {
      color: {
        title: false,
        position: 'right',
        rowPadding: 5,
      },
    },
    annotations: [
      {
        type: 'text',
        style: {
          text: `${total}`,
          x: '50%',
          y: '50%',
          textAlign: 'center',
          fontSize: 20,
          fontStyle: 'bold',
          fill: token.colorTextLabel,
        },
      },
    ],
  };
  return <Pie {...pieConfig} />;
};

export default DonutChart;

