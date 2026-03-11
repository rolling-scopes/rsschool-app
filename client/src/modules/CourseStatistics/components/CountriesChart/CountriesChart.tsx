import { Bar, BarConfig } from '@ant-design/plots';
import { Flex, Image, Typography } from 'antd';
import { CountryStatDto } from 'api';
import { useMemo } from 'react';
import { Colors } from '../../data';

type Props = {
  data: CountryStatDto[];
  activeCount: number;
  xAxisTitle: string;
  color?: Colors;
};

const { Text } = Typography;

function CountriesChart({ data, activeCount, xAxisTitle, color = Colors.Blue }: Props) {
  const config: BarConfig = useMemo(
    () => ({
      data,
      xField: 'countryName',
      yField: 'count',
      axis: {
        x: { labelAutoRotate: false },
        y: { title: xAxisTitle },
      },
      tooltip: {
        items: [
          (d: Record<string, number | undefined>) => {
            const count = d.count ?? 0;
            const percentage = activeCount ? Math.ceil((count / activeCount) * 100) : 0;
            return { name: xAxisTitle, value: `${count} (${percentage}%)` };
          },
        ],
      },
      scrollbar: { x: {} },
      style: { fill: color },
    }),
    [data, activeCount, xAxisTitle, color],
  );

  if (!data.length) {
    return (
      <Flex vertical gap="middle" align="center" justify="center">
        <Text strong>No student data available to display</Text>
        <Image preview={false} src="/static/svg/err.svg" alt="Error 404" width={175} height={175} />
      </Flex>
    );
  }

  return <Bar {...config} />;
}

export default CountriesChart;
