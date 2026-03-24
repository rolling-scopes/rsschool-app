import { Bar, BarConfig } from '@ant-design/plots';
import { Flex, Image, Typography } from 'antd';
import { CountryStatDto } from '@client/api';
import { useCallback, useMemo } from 'react';
import { Colors } from '../../data';
import { useTheme } from '@client/shared/hooks/useTheme';

type Props = {
  data: CountryStatDto[];
  activeCount: number;
  xAxisTitle: string;
  color?: Colors;
};

/*
 * Defining the Datum type manually as it cannot be imported directly from @ant-design/plots.
 * This type is inferred from the 'data' property of the Bar component's first parameter.
 * This approach is necessary because @ant-design/plots does not explicitly export the Datum type.
 * Use this type definition cautiously and review it if the library updates.
 */
type Datum = Parameters<typeof Bar>[0]['data'][number];

const { Text } = Typography;

function CountriesChart({ data, activeCount, xAxisTitle, color = Colors.Blue }: Props) {
  const { theme } = useTheme();
  const tooltipFormatter = useCallback(
    (datum: Datum) => {
      const percentage = activeCount ? Math.ceil((datum.count / activeCount) * 100) : 0;
      return {
        name: xAxisTitle,
        value: `${datum.count} (${percentage}%)`,
      };
    },
    [activeCount],
  );

  const config: BarConfig = useMemo(
    () => ({
      data,
      xField: 'count',
      yField: 'countryName',
      axis: {
        y: { labelAutoRotate: false },
        x: { title: xAxisTitle },
      },
      tooltip: { formatter: tooltipFormatter },
      scrollbar: { type: 'vertical' },
      colorField: 'countryName',
      color,
      theme,
    }),
    [data, tooltipFormatter, color, theme],
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
