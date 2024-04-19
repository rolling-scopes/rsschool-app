import { Datum } from '@antv/g2plot';
import { Card, Flex, Form, Image, Select, Space, Typography } from 'antd';
import { CourseStatsApi, CourseTaskDto, TaskPerformanceStatsDto } from 'api';
import { useActiveCourseContext } from 'modules/Course/contexts';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useAsync } from 'react-use';
import { Colors } from '../../data';
import { PieConfig } from '@ant-design/plots';

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

function getPerformanceDescriptionByType(type: string) {
  switch (type) {
    case 'Minimal':
      return 'Number of students scoring between 1% and 20% of the maximum points';
    case 'Low':
      return 'Number of students scoring between 21% and 50% of the maximum points';
    case 'Moderate':
      return 'Number of students scoring between 51% and 70% of the maximum points';
    case 'High':
      return 'Number of students scoring between 71% and 90% of the maximum points';
    case 'Exceptional':
      return 'Number of students scoring between 91% and 99% of the maximum points';
    case 'Perfect':
      return 'Number of students achieving a perfect score of 100%';
    default:
      return 'Unknown score category';
  }
}

function getChartConfig(): Partial<PieConfig> {
  return {
    tooltip: {
      customContent: (title, items) => {
        return (
          <Space direction="vertical" style={{ margin: 8 }}>
            <Text strong>{title}</Text>
            {items.map(({ name, value }) => (
              <Text key={name}>
                {getPerformanceDescriptionByType(name)}: <Text strong>{value}</Text>
              </Text>
            ))}
          </Space>
        );
      },
      showDelay: 32,
    },
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
