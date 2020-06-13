import * as React from 'react';
import { useState } from 'react';
import CommonCard from './CommonDashboardCard';
import { AuditOutlined } from '@ant-design/icons';
import { CourseTask } from 'services/course';
import { Doughnut } from 'react-chartjs-2';
import { StudentStats } from '../../../../common/models';
import { TasksStatsModal } from './TasksStatsModal';

export interface TasksStatistics {
  completed: (CourseTask | StudentStats)[];
  notDone: (CourseTask | StudentStats)[];
  future: (CourseTask | StudentStats)[];
}

export interface ITooltipItem {
  datasetIndex: number;
  index: number;
  x: number;
  xLabel: string;
  y: number;
  yLabel: number;
}

export interface ITooltipData {
  datasets: IChartsConfigDataDatasets[];
  labels: string[];
}

interface IChartsConfigDataDatasets {
  data: number[];
  backgroundColor?: string[];
  hoverBackgroundColor?: string[];
}

enum GroupTaskName {
  Completed = 'Completed',
  NotCompleted = 'Not completed',
  Future = 'Future',
}

type Props = {
  tasks: TasksStatistics;
  courseName: string;
};

export function TasksStatsCard(props: Props) {
  const [isTasksStatsModalVisible, setTasksStatsModalVisible] = useState(false);
  const [statisticsTableName, setStatisticsTableName] = useState('');
  const [selectedGroupTasks, setCurrentTaskStatsModal] = useState([] as (CourseTask | StudentStats)[]);

  const {
    tasks: { completed, notDone, future },
    courseName,
  } = props;

  const showTasksStatsModal = (chartLabel: string) => {
    switch (chartLabel) {
      case GroupTaskName.Completed:
        setCurrentTaskStatsModal(completed);
        setStatisticsTableName('Completed tasks');
        break;
      case GroupTaskName.Future:
        setCurrentTaskStatsModal(future);
        setStatisticsTableName('Tasks not completed');
        break;
      default:
        setStatisticsTableName('Future tasks');
        setCurrentTaskStatsModal(notDone);
        break;
    }
    setTasksStatsModalVisible(true);
  };

  const hideTasksStatsModal = () => {
    setTasksStatsModalVisible(false);
  };

  const setChartTooltipOptions = () => {
    return {
      title(tooltipItems: ITooltipItem[], data: ITooltipData) {
        const index: number = tooltipItems[0].index;
        const label: string = data.labels[index].toLowerCase();
        const value: number = data.datasets[0].data[index];
        return `Tasks ${label}: ${value}`;
      },
      label() {
        return;
      },
      footer() {
        return ' Click to see details';
      },
    };
  };

  const dataForChart = {
    labels: [GroupTaskName.Completed, GroupTaskName.NotCompleted, GroupTaskName.Future],
    datasets: [
      {
        data: [completed.length, notDone.length, future.length],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  const options = {
    cutoutPercentage: 20,
    legend: {
      labels: {
        fontSize: 14,
        padding: 30,
        boxWidth: 15,
      },
      position: 'bottom',
    },
    tooltips: {
      titleFontStyle: 'normal',
      titleFontSize: 14,
      callbacks: setChartTooltipOptions(),
    },
    onClick: (_: any, chartItem: any) => {
      if (chartItem[0]) {
        showTasksStatsModal(chartItem[0]._model.label);
      }
    },
  };

  return (
    <>
      <TasksStatsModal
        courseName={courseName}
        tableName={statisticsTableName}
        tasks={selectedGroupTasks}
        isVisible={isTasksStatsModalVisible}
        onHide={hideTasksStatsModal}
      />
      <CommonCard
        title="Tasks statistics"
        icon={<AuditOutlined />}
        content={
          <div style={{ minHeight: 220, minWidth: 220, maxWidth: 250, margin: 'auto' }}>
            <Doughnut width={50} height={50} data={dataForChart} options={options} />
          </div>
        }
      />
    </>
  );
}
