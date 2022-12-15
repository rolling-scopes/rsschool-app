import { Button, Card, Col, Divider, Row, Tag, Typography } from 'antd';
import Link from 'next/link';
import { getAutoTestTaskRoute } from 'services/routes';
import { TaskCardColumn, TaskDeadlineDate } from '..';
import { Course } from 'services/models';
import { useAttemptsMessage } from 'modules/AutoTest/hooks';
import { CourseTaskState, CourseTaskVerifications } from '../../types';

const { Title, Paragraph } = Typography;

export interface TaskCardProps {
  courseTask: CourseTaskVerifications;
  course: Course;
}

function getStatusTag(state: CourseTaskState) {
  switch (state) {
    case CourseTaskState.Completed:
      return <Tag color="success">{state}</Tag>;
    case CourseTaskState.Missed:
      return <Tag color="error">{state}</Tag>;
    default:
      return <Tag color="default">{CourseTaskState.Uncompleted}</Tag>;
  }
}

function TaskCard({ courseTask, course }: TaskCardProps) {
  const { id, name, studentStartDate, studentEndDate, verifications, state } = courseTask;
  const { attemptsCount, explanation } = useAttemptsMessage(courseTask);

  const score = verifications?.[0]?.score ?? null;

  const columns = [
    {
      label: 'Status',
      value: getStatusTag(state),
    },
    {
      label: 'Attempts',
      value: attemptsCount >= 0 ? `${attemptsCount} left` : 'No limits',
    },
    {
      label: 'Score',
      value: score !== null ? score : <>&ndash;</>,
    },
  ];

  return (
    <Card
      title={
        <Title level={5} ellipsis={true}>
          {name}
        </Title>
      }
      extra={<TaskDeadlineDate startDate={studentStartDate} endDate={studentEndDate} state={state} />}
    >
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Paragraph
            ellipsis={{
              expandable: true,
              rows: 3,
              symbol: 'Read more',
            }}
          >
            {explanation}
          </Paragraph>
        </Col>
        <Col span={24}>
          <Link href={getAutoTestTaskRoute(course.alias, id)}>
            <Button type="primary">View details</Button>
          </Link>
        </Col>
      </Row>
      <Divider />
      <Row gutter={8}>
        {columns.map(item => (
          <Col flex="auto" key={item.label}>
            <TaskCardColumn {...item} />
          </Col>
        ))}
      </Row>
    </Card>
  );
}

export default TaskCard;
