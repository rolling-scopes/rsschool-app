import React from 'react';
import { Datum, Gauge, GaugeConfig } from '@ant-design/charts';

const PerformanceChart: React.FC<{ percent: number; text?: string }> = ({ percent, text = '' }) => {
  const COLORS = {
    primaryColor: '#1890FFD9',
    secondaryColor: '#1890FF',
    titleColor: 'rgba(0, 0, 0, 0.85)',
    contentColor: 'rgba(0, 0, 0, 0.45)',
  };

  const config: GaugeConfig = {
    style: {
      height: 200,
      width: 200,
    },
    // when percent = 0 range looks the same as when percent = 100 (colorful), therefore added that patch
    percent: percent === 0 ? 0.001 : percent,
    range: {
      color: COLORS.primaryColor,
      width: 12.6,
    },
    indicator: {
      pointer: {
        style: {
          stroke: COLORS.secondaryColor,
        },
      },
      pin: {
        style: {
          stroke: COLORS.secondaryColor,
        },
      },
    },
    axis: {
      tickLine: {
        style: {
          stroke: COLORS.secondaryColor,
          lineWidth: 2,
        },
        length: -8,
      },
      subTickLine: {
        count: 0,
      },
      tickInterval: 0.333,
      label: {
        style: {
          opacity: 0,
        },
      },
    },
    statistic: {
      title: {
        formatter: ({ percent }: Datum = { percent: 0 }) => `${Math.round(percent * 100)}%`,
        offsetY: 10,
        style: {
          fontSize: '24px',
          lineHeight: '32px',
          color: COLORS.titleColor,
        },
      },
      content: {
        offsetY: 50,
        style: {
          fontSize: '14px',
          lineHeight: '22px',
          color: COLORS.contentColor,
        },
        formatter: () => text,
      },
    },
  };

  return <Gauge {...config} />;
};

export default PerformanceChart;
