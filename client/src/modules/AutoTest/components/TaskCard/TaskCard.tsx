import { Button, Card, Col, Divider, Row, Tag, Typography } from 'antd';
import React from 'react';
import { CourseTaskDetailedDto } from 'api';
import { SelfEducationPublicAttributes, Verification } from 'services/course';
import { parseCourseTask } from '../../utils/parseCourseTask';
import moment from 'moment';
import Link from 'next/link';
import * as routes from 'services/routes';
import { TaskCardColumn, TaskDeadlineDate } from '..';

const { Title, Paragraph } = Typography;

interface TaskCardProps {
  courseTask: CourseTaskDetailedDto;
  verifications: Verification[];
  courseAlias: string;
}

enum Status {
  Uncompleted = 'Uncompleted',
  Missed = 'Missed',
  Completed = 'Completed',
}

function getStatus(startDate: string, endDate: string, score?: number | null) {
  const now = moment();
  const start = moment(startDate);
  const end = moment(endDate);

  if (now.isBetween(start, end)) {
    return <Tag color="default">{Status.Uncompleted}</Tag>;
  }

  if (now.isAfter(end) && score) {
    return <Tag color="success">{Status.Completed}</Tag>;
  }

  if (now.isAfter(end) && !score) {
    return <Tag color="error">{Status.Missed}</Tag>;
  }
}

function TaskCard({ courseTask: origin, verifications, courseAlias }: TaskCardProps) {
  const { id, name, studentStartDate, studentEndDate, publicAttributes } = parseCourseTask(origin);

  const { maxAttemptsNumber = 0 } = (publicAttributes as SelfEducationPublicAttributes) ?? {};
  const attemptsLeft = maxAttemptsNumber - verifications.length;

  const score = verifications.at(-1)?.score ?? null;

  const columns = [
    {
      label: 'Status',
      value: getStatus(studentStartDate, studentEndDate, score),
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
          <Link href={routes.getAutoTestRoute(courseAlias, id)}>
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
