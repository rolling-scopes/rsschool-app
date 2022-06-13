import { CourseTaskDto } from 'api';
import { StudentStats } from 'common/models';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { getQueryString } from 'utils/queryParams-utils';
import CommonCard from './CommonDashboardCard';
import { TasksStatsModal } from './TasksStatsModal';

const TasksChart = dynamic(() => import('./TasksChart'), { ssr: false });

export interface TasksStatistics {
  completed: (CourseTaskDto | StudentStats)[];
  notDone: (CourseTaskDto | StudentStats)[];
  future: (CourseTaskDto | StudentStats)[];
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
  Completed = 'completed',
  NotCompleted = 'notCompleted',
  Future = 'future',
}

type Props = {
  tasks: TasksStatistics;
  courseName: string;
};

export function TasksStatsCard(props: Props) {
  const [isTasksStatsModalVisible, setTasksStatsModalVisible] = useState(false);
  const [statisticsTableName, setStatisticsTableName] = useState('');
  const [selectedGroupTasks, setCurrentTaskStatsModal] = useState([] as (CourseTaskDto | StudentStats)[]);

  const {
    tasks: { completed, notDone, future },
    courseName,
  } = props;

  const router = useRouter();
  const queryStatType = router.query.statType ? (router.query.statType as string) : null;

  useEffect(() => {
    if (queryStatType) {
      showTasksStatsModal(queryStatType);
    }
  }, [queryStatType]);

  function updateUrl(statType?: string) {
    const query = { ...router.query };
    if (statType) {
      query.statType = statType;
    } else {
      delete query.statType;
    }
    const url = `${router.route}${getQueryString(query)}`;
    router.replace(url);
  }

  const showTasksStatsModal = useCallback((chartLabel: string) => {
    switch (chartLabel) {
      case GroupTaskName.Completed:
        setStatisticsTableName('Completed tasks');
        setCurrentTaskStatsModal(completed);
        break;
      case GroupTaskName.Future:
        setStatisticsTableName('Future tasks');
        setCurrentTaskStatsModal(future);
        break;
      default:
        setStatisticsTableName('Tasks not completed');
        setCurrentTaskStatsModal(notDone);
        break;
    }
    setTasksStatsModalVisible(true);
  }, []);

  const hideTasksStatsModal = () => {
    setTasksStatsModalVisible(false);
    updateUrl();
  };

  const data = [
    { value: completed.length, type: GroupTaskName.Completed },
    { value: notDone.length, type: GroupTaskName.NotCompleted },
    { value: future.length, type: GroupTaskName.Future },
  ].filter(item => item.value);

  const colors = {
    [GroupTaskName.Completed]: '#FF6384',
    [GroupTaskName.NotCompleted]: '#36A2EB',
    [GroupTaskName.Future]: '#FFCE56',
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
        content={
          <div style={{ minWidth: 200, maxWidth: 200, margin: 'auto' }}>
            <TasksChart data={data} colors={colors} onItemSelected={data => updateUrl(data.type)} />
          </div>
        }
      />
    </>
  );
}
