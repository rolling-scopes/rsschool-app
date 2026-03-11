import { Pie, PieConfig } from '@ant-design/plots';
import { getTaskStatusColor } from 'modules/Schedule';
import { CourseScheduleItemDtoStatusEnum } from 'api';
import React, { useMemo } from 'react';
import capitalize from 'lodash/capitalize';

type Item = { status: string; value: number };

type Props = {
  data: Item[];
  onItemSelected: (item: Item) => void;
};

export function TasksChart({ data, onItemSelected }: Props) {
  const statusColors = useMemo(
    () => data.map(d => getTaskStatusColor(d.status as CourseScheduleItemDtoStatusEnum)),
    [data],
  );

  const config: PieConfig = {
    data,
    angleField: 'value',
    colorField: 'status',
    radius: 1,
    innerRadius: 0.78,
    autoFit: true,
    label: {
      text: 'value',
      position: 'inside',
      style: {
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 400,
      },
    },
    scale: {
      color: {
        range: statusColors,
      },
    },
    legend: {
      color: {
        position: 'right',
        layout: { justifyContent: 'center' },
        itemLabelText: (datum: Record<string, string>) => {
          const item = data.find(d => d.status === datum.status);
          return `${capitalize(datum.status)} ${item?.value ?? ''}`;
        },
        itemLabelFontSize: 14,
        itemLabelFontFamily: 'sans-serif',
        rowPadding: 20,
      },
    },
    interaction: {
      elementHighlight: true,
    },
    onEvent: (_chart, event) => {
      if (event.type === 'element:click') {
        const clickedData = (event as unknown as { data: { data: Item } }).data?.data;
        if (clickedData) {
          onItemSelected(clickedData);
        }
      }
    },
  };
  return <Pie {...config} />;
}

export default TasksChart;
