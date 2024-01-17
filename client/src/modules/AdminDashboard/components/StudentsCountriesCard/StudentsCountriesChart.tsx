import { Bar, BarConfig } from '@ant-design/plots';
import { Flex, Image, Typography } from 'antd';
import { CountryStatDto } from 'api';
import { useCallback, useMemo } from 'react';

type Props = {
  data: CountryStatDto[];
  studentsActiveCount: number;
};

/*
 * Defining the Datum type manually as it cannot be imported directly from @ant-design/plots.
 * This type is inferred from the 'data' property of the Bar component's first parameter.
 * This approach is necessary because @ant-design/plots does not explicitly export the Datum type.
 * Use this type definition cautiously and review it if the library updates.
 */
type Datum = Parameters<typeof Bar>[0]['data'][number];

const { Text } = Typography;

function StudentsCountriesChart({ data, studentsActiveCount }: Props) {
  const tooltipFormatter = useCallback(
    (datum: Datum) => {
      const percentage = studentsActiveCount ? Math.ceil((datum.studentsCount / studentsActiveCount) * 100) : 0;
      return {
        name: 'Number of Students',
        value: `${datum.studentsCount} (${percentage}%)`,
      };
    },
    [studentsActiveCount],
  );

  const config: BarConfig = useMemo(
    () => ({
      data,
      yField: 'country',
      xField: 'studentsCount',
      yAxis: {
        label: { autoRotate: false },
      },
      tooltip: { formatter: tooltipFormatter },
      xAxis: { title: { text: 'Number of Students' } },
      scrollbar: { type: 'vertical' },
    }),
    [data, tooltipFormatter],
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

export default StudentsCountriesChart;
