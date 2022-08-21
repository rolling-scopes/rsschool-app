import { Pie, PieConfig } from '@ant-design/plots';
import React from 'react';

type Item = { type: string; value: number };

type Props = {
  data: Item[];
  colors: Record<string, string>;
  onItemSelected: (item: Item) => void;
};

export function TasksChart({ data, colors, onItemSelected }: Props) {
  const config: PieConfig = {
    appendPadding: 1,
    data,
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    innerRadius: 0.4,
    label: {
      type: 'inner',
      offset: '-50%',
      content: '{value}',
      style: {
        textAlign: 'center',
        fontSize: 14,
      },
    },
    color: ({ type }) => colors[type],
    legend: false,
    style: {
      width: 200,
      height: 200,
    },
    interactions: [{ type: 'element-active' }],
    statistic: {
      title: false,
    },
    onReady: plot =>
      plot.chart.on('element:click', (evt: { data: { data: Item } }) => {
        onItemSelected(evt.data.data);
      }),
  };
  return <Pie {...config} />;
}

export default TasksChart;
