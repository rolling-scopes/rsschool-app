import { Datum } from '@antv/g2plot';
import { Card, Flex, Form, Image, Select, Typography } from 'antd';
import { CourseStatsApi, CourseTaskDto, TaskPerformanceStatsDto } from 'api';
import { useActiveCourseContext } from 'modules/Course/contexts';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useAsync } from 'react-use';
import { Colors } from '../data';

const courseStatsApi = new CourseStatsApi();

type Props = {
  tasks: CourseTaskDto[];
};

const { Text } = Typography;

const DonutChart = dynamic(() => import('../DonutChart/DonutChart'), { ssr: false });

export const TaskPerformanceCard = ({ tasks }: Props) => {
  const { course } = useActiveCourseContext();

  const [taskId, setTaskId] = useState<number>();

  const { value: taskPerformanceStats } = useAsync(async () => {
    if (taskId) {
      const { data } = await courseStatsApi.getTaskPerformance(course.id, taskId);
      return data;
    }
  }, [taskId]);

  return (
    <Card title="Task Performance">
      <Form.Item name="courseTaskIds">
        <Select
          placeholder="Select tasks"
          showSearch
          optionFilterProp="label"
          onChange={(value: number) => setTaskId(value)}
          options={tasks.map(({ name, id }) => ({
            label: name,
            value: id,
          }))}
        />
      </Form.Item>
      <div style={{ height: 250, width: '100%' }}>
        {taskPerformanceStats?.totalAchievement ? (
          <DonutChart data={getChartData(taskPerformanceStats)} config={getChartConfig()} />
        ) : (
          <Flex vertical align="center" justify="center">
            <Text>No data available for this task, please select another task.</Text>
            <Image preview={false} src="/static/svg/err.svg" alt="Error 404" width={175} height={175} />
          </Flex>
        )}
      </div>
    </Card>
  );
};

function getChartConfig() {
  return {
    color: ({ type }: Datum) => {
      switch (type) {
        case 'Minimal':
          return Colors.Volcano;
        case 'Low':
          return Colors.Orange;
        case 'Moderate':
          return Colors.Blue;
        case 'High':
          return Colors.Lime;
        case 'Exceptional':
          return Colors.Purple;
        case 'Perfect':
          return Colors.Magenta;
        default:
          return Colors.Gray;
      }
    },
  };
}

function getChartData(taskPerformanceStats: TaskPerformanceStatsDto) {
  return [
    { type: 'Minimal', value: taskPerformanceStats.minimalAchievement },
    { type: 'Low', value: taskPerformanceStats.lowAchievement },
    { type: 'Moderate', value: taskPerformanceStats.moderateAchievement },
    { type: 'High', value: taskPerformanceStats.highAchievement },
    { type: 'Exceptional', value: taskPerformanceStats.exceptionalAchievement },
    { type: 'Perfect', value: taskPerformanceStats.perfectScores },
  ].filter(({ value }) => value > 0);
}
