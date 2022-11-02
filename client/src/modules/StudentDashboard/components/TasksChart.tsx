import { Pie, PieConfig } from '@ant-design/plots';
import { getTaskStatusColor } from 'modules/Schedule';
import React from 'react';
import capitalize from 'lodash/capitalize';
import { useMeasure } from 'react-use';

type Item = { status: string; value: number };

type Props = {
  data: Item[];
  onItemSelected: (item: Item) => void;
};

export function TasksChart({ data, onItemSelected }: Props) {
  const [ref, { width }] = useMeasure();
  const config: PieConfig = {
    appendPadding: 1,
    data,
    angleField: 'value',
    colorField: 'status',
    radius: 0.7,
    innerRadius: 0.66,

    label: {
      type: 'inner',
      offset: '-50%',
      content: '{value}',
      style: {
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 400,
      },
      autoRotate: false,
    },
    color: ({ status }) => getTaskStatusColor(status),
    legend: {
      layout: 'vertical',
      position: width > 300 ? 'right' : 'bottom',
      itemMarginBottom: 20,
      itemName: {
        formatter: (status, _, index) => {
          return `${capitalize(status)} ${data[index].value}`;
        },
        style: {
          fontSize: 14,
          fontFamily: 'sans-serif',
        },
      },
    },
    interactions: [
      {
        type: 'element-active',
      },
      {
        type: 'pie-statistic-active',
      },
    ],
    statistic: {
      title: {
        formatter: datum => {
          if (!datum) return 'Total tasks';
          return capitalize(datum.status);
        },
        style: {
          color: 'rgba(0,0,0,0.45)',
          fontSize: '14px',
        },
      },
      content: {
        offsetY: 10,
        style: {
          fontSize: '30px',
        },
      },
    },
    onReady: plot => {
      ref(plot.container);
      plot.chart.on('element:click', (evt: { data: { data: Item } }) => {
        onItemSelected(evt.data.data);
      });
    },
  };
  return <Pie {...config} />;
}

export default TasksChart;
