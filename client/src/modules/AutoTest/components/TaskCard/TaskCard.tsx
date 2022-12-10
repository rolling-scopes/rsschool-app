import { Button, Card, Col, Divider, Row, Tag, Typography } from 'antd';
import React from 'react';
import { CourseTaskDetailedDto } from 'api';
import { Verification } from 'services/course';
import getStatusByDate, { AutoTestTaskStatus } from 'modules/AutoTest/utils/getStatusByDate';
import Link from 'next/link';
import { getAutoTestTaskRoute } from 'services/routes';
import { TaskCardColumn, TaskDeadlineDate } from '..';
import { Course } from 'services/models';
import { useAttemptsMessage } from 'modules/AutoTest/hooks';

const { Title, Paragraph } = Typography;

export interface TaskCardProps {
  courseTask: CourseTaskDetailedDto;
  course: Course;
  verifications: Verification[];
}

function getStatusTag(endDate: string, score?: number | null) {
  const status = getStatusByDate(endDate, score);

  switch (status) {
    case AutoTestTaskStatus.Completed:
      return <Tag color="success">{status}</Tag>;
    case AutoTestTaskStatus.Missed:
      return <Tag color="error">{status}</Tag>;
    default:
      return <Tag color="default">{AutoTestTaskStatus.Uncompleted}</Tag>;
  }
}

function TaskCard({ courseTask, course, verifications }: TaskCardProps) {
  const { id, name, studentStartDate, studentEndDate } = courseTask;
  const { attemptsCount, explanation } = useAttemptsMessage(courseTask, verifications);

  const score = verifications?.[0]?.score ?? null;

  const columns = [
    {
      label: 'Status',
      value: getStatusTag(studentEndDate, score),
    },
    {
      label: 'Attempts',
      value: `${attemptsCount} left`,
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
      extra={<TaskDeadlineDate startDate={studentStartDate} endDate={studentEndDate} score={score} />}
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
