import { Card, Flex, Form, Image, Select, Typography } from 'antd';
import { CourseStatsApi, CourseTaskDto, TaskPerformanceStatsDto } from '@client/api';
import { useActiveCourseContext } from 'modules/Course/contexts';
import { useState } from 'react';
import { useAsync } from 'react-use';
import { Colors, StudentPerformanceDescription, StudentPerformanceType } from '../../data';
import { PieConfig } from '@ant-design/plots';
import { dynamicWithSkeleton } from '@client/utils/dynamicWithSkeleton';

const courseStatsApi = new CourseStatsApi();

type Props = {
  tasks: CourseTaskDto[];
};

const { Text } = Typography;

const DonutChart = dynamicWithSkeleton(() => import('../DonutChart/DonutChart'));

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
      items: [
        (d: Record<string, string | number>) => ({
          name: getPerformanceDescriptionByType(d.type as string),
          value: d.value,
        }),
      ],
    },
    scale: {
      color: {
        range: [Colors.Volcano, Colors.Orange, Colors.Blue, Colors.Lime, Colors.Purple, Colors.Magenta],
      },
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
