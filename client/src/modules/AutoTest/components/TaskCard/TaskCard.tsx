import { Button, Card, Col, Divider, Row, Tag, Typography } from 'antd';
import React from 'react';
import { CourseTaskDetailedDto } from 'api';
import { SelfEducationPublicAttributes, Verification } from 'services/course';
import { parseCourseTask } from 'modules/AutoTest/utils/parseCourseTask';
import getStatusByDate, { AutoTestTaskStatus } from 'modules/AutoTest//utils/getStatusByDate';
import Link from 'next/link';
import { getAutoTestTaskRoute } from 'services/routes';
import { TaskCardColumn, TaskDeadlineDate } from '..';

const { Title, Paragraph } = Typography;

interface TaskCardProps {
  courseTask: CourseTaskDetailedDto;
  verifications: Verification[];
  courseAlias: string;
}

function getStatusTag(endDate: string, score?: number | null) {
  const status = getStatusByDate(endDate, score);

  switch (status) {
    case AutoTestTaskStatus.Completed:
      return <Tag color="success">{status}</Tag>;
    case AutoTestTaskStatus.Missed:
      return <Tag color="error">{status}</Tag>;
    case AutoTestTaskStatus.Uncompleted:
      return <Tag color="default">{status}</Tag>;
    default:
      return;
  }
}

function TaskCard({ courseTask: origin, verifications, courseAlias }: TaskCardProps) {
  const { id, name, studentStartDate, studentEndDate, publicAttributes } = parseCourseTask(origin);

  const { maxAttemptsNumber = 0 } = (publicAttributes as SelfEducationPublicAttributes) ?? {};
  const attemptsLeft = maxAttemptsNumber - verifications.length;

  const score = verifications.at(0)?.score ?? null;

  const columns = [
    {
      label: 'Status',
      value: getStatusTag(studentEndDate, score),
    },
    {
      label: 'Attempts',
      value: `${attemptsLeft} left`,
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
      extra={<TaskDeadlineDate startDate={studentStartDate} endDate={studentEndDate} />}
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
            You can submit your solution as many times as you need before the deadline. Without fines. After the
            deadline, the submission will be closed.
          </Paragraph>
        </Col>
        <Col span={24}>
          <Link href={getAutoTestTaskRoute(courseAlias, id)}>
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
