import React from 'react';
import { Datum, Gauge, GaugeConfig } from '@ant-design/charts';

const PerformanceChart: React.FC<{ percent: number; text: string }> = ({ percent, text }) => {
  const ticks = [0, 1];
  const color = ['#F4664A', '#FAAD14', '#30BF78'];
  const config: GaugeConfig = {
    style: {
      height: 200,
      width: 200,
    },
    percent,
    innerRadius: 0.75,
    type: 'meter',
    range: {
      ticks,
      color: ['l(0) 0:#F4664A 0.5:#FAAD14 1:#30BF78'],
    },
    indicator: {
      pointer: { style: { stroke: '#D0D0D0' } },
      pin: { style: { stroke: '#D0D0D0' } },
    },
    statistic: {
      title: {
        formatter: ({ percent }: Datum = { percent: 0 }) => `${percent * 100}%`,
        style: ({ percent }: Datum = { percent: 0 }) => ({
          fontSize: '14px',
          lineHeight: 1,
          color: percent < ticks[1] ? color[0] : percent < ticks[2] ? color[1] : color[2],
        }),
      },
      content: {
        offsetY: 36,
        style: { fontSize: '18px', color: '#4B535E' },
        formatter: () => text,
      },
    },
  };

  return <Gauge {...config} />;
};

export default PerformanceChart;
