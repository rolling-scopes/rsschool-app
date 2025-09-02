import { Datum } from '@antv/g2plot';
import { Card, Flex, Form, Image, Select, Skeleton, Typography } from 'antd';
import { CourseStatsApi, CourseTaskDto, TaskPerformanceStatsDto } from 'api';
import { useActiveCourseContext } from 'modules/Course/contexts';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useAsync } from 'react-use';
import { Colors, StudentPerformanceDescription, StudentPerformanceType } from '../../data';
import { PieConfig } from '@ant-design/plots';

const courseStatsApi = new CourseStatsApi();

type Props = {
  tasks: CourseTaskDto[];
};

const { Text } = Typography;

const DonutChart = dynamic(() => import('../DonutChart/DonutChart'), {
  ssr: false,
  loading: () => <Skeleton active={true} />,
});

export const TaskPerformanceCard = ({ tasks }: Props) => {
  const { course } = useActiveCourseContext();
  console.log(tasks[0])

  const [taskId, setTaskId] = useState<number>();

  const { value: taskPerformanceStats } = useAsync(async () => {
    if (taskId) {
      const { data } = await courseStatsApi.getTaskPerformance(course.id, taskId);
      return data;
    }
  }, [taskId]);

  return (
    <Card title="Task Performance">
      <Form>
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
      </Form>
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
    case StudentPerformanceType.Minimal:
      return StudentPerformanceDescription.Minimal;
    case StudentPerformanceType.Low:
      return StudentPerformanceDescription.Low;
    case StudentPerformanceType.Moderate:
      return StudentPerformanceDescription.Moderate;
    case StudentPerformanceType.High:
      return StudentPerformanceDescription.High;
    case StudentPerformanceType.Exceptional:
      return StudentPerformanceDescription.Exceptional;
    case StudentPerformanceType.Perfect:
      return StudentPerformanceDescription.PerfectScore;
    default:
      return StudentPerformanceDescription.Unknown;
  }
}

function getChartConfig(): Partial<PieConfig> {
  return {
    tooltip: {
      customContent: (_, items) => {
        return (
          <>
            {items.map(({ name, value }) => (
              <Text key={name}>
                {getPerformanceDescriptionByType(name)}: <Text strong>{value}</Text>
              </Text>
            ))}
          </>
        );
      },
      showDelay: 32,
    },
    color: ({ type }: Datum) => {
      switch (type) {
        case StudentPerformanceType.Minimal:
          return Colors.Volcano;
        case StudentPerformanceType.Low:
          return Colors.Orange;
        case StudentPerformanceType.Moderate:
          return Colors.Blue;
        case StudentPerformanceType.High:
          return Colors.Lime;
        case StudentPerformanceType.Exceptional:
          return Colors.Purple;
        case StudentPerformanceType.Perfect:
          return Colors.Magenta;
        default:
          return Colors.Gray;
      }
    },
  };
}

function getChartData(taskPerformanceStats: TaskPerformanceStatsDto) {
  return [
    { type: StudentPerformanceType.Minimal, value: taskPerformanceStats.minimalAchievement },
    { type: StudentPerformanceType.Low, value: taskPerformanceStats.lowAchievement },
    { type: StudentPerformanceType.Moderate, value: taskPerformanceStats.moderateAchievement },
    { type: StudentPerformanceType.High, value: taskPerformanceStats.highAchievement },
    { type: StudentPerformanceType.Exceptional, value: taskPerformanceStats.exceptionalAchievement },
    { type: StudentPerformanceType.Perfect, value: taskPerformanceStats.perfectScores },
  ].filter(({ value }) => value > 0);
}
