import { CourseScheduleItemDto, CourseScheduleItemDtoStatusEnum } from 'api';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getQueryString } from 'utils/queryParams-utils';
import CommonCard from './CommonDashboardCard';
import { TasksStatsModal } from './TasksStatsModal';

const TasksChart = dynamic(() => import('./TasksChart'), { ssr: false });

export type TaskStat = CourseScheduleItemDto & { comment?: string; githubPrUri?: string };

type Props = {
  tasksByStatus: Record<CourseScheduleItemDtoStatusEnum, TaskStat[]>;
  courseName: string;
};

export function TasksStatsCard(props: Props) {
  const [selectedStatus, setSelectedStatus] = useState<CourseScheduleItemDtoStatusEnum | null>(null);

  const { courseName, tasksByStatus } = props;

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

  const showTasksStatsModal = useCallback((name: string) => {
    const status = name as CourseScheduleItemDtoStatusEnum;
    if (!Object.values(CourseScheduleItemDtoStatusEnum).includes(status)) return;

    setSelectedStatus(status);
  }, []);

  const hideTasksStatsModal = () => {
    setSelectedStatus(null);
    updateUrl();
  };

  const chartData = useMemo(
    () =>
      Object.entries(tasksByStatus).map(([status, tasks]) => {
        return {
          value: tasks.length,
          status,
        };
      }),
    [tasksByStatus],
  );

  return (
    <>
      <TasksStatsModal
        courseName={courseName}
        tableName={`${selectedStatus} tasks`}
        tasks={selectedStatus ? tasksByStatus[selectedStatus] : []}
        isVisible={!!selectedStatus}
        onHide={hideTasksStatsModal}
      />
      <CommonCard
        title="Tasks statistics"
        content={
          <div>
            <TasksChart data={chartData} onItemSelected={data => updateUrl(data.status)} />
          </div>
        }
      />
    </>
  );
}
