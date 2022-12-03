import { Button, Card, Col, Divider, Row, Tag, Typography } from 'antd';
import React from 'react';
import { CourseTaskDetailedDto } from 'api';
import { TestDeadlineDate, TestCardColumn } from '..';
import { SelfEducationPublicAttributes, Verification } from 'services/course';
import { parseCourseTask } from '../../utils/parseCourseTask';
import moment from 'moment';

const { Title, Text } = Typography;

interface TestCardProps {
  courseTask: CourseTaskDetailedDto;
  verifications: Verification[];
  courseId: number;
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

function TestCard({ courseTask: origin, verifications, courseId }: TestCardProps) {
  const courseTask = parseCourseTask(origin);

  const { maxAttemptsNumber = 0 } = (courseTask.publicAttributes as SelfEducationPublicAttributes) ?? {};
  const attemptsLeft = maxAttemptsNumber - verifications.length;

  const score = verifications.at(-1)?.score ?? null;

  return (
    <Card
      title={
        <Title level={5} ellipsis={true}>
          {courseTask.name}
        </Title>
      }
      extra={<TestDeadlineDate startDate={courseTask.studentStartDate} endDate={courseTask.studentEndDate} />}
    >
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Text>
            You can submit your solution as many times as you need before the deadline. Without fines. After the
            deadline, the submission will be closed.
          </Text>
        </Col>
        <Col span={24}>
          <Button type="primary">View details</Button>
        </Col>
      </Row>
      <Divider />
      <Row gutter={16}>
        <Col span={8}>
          <TestCardColumn
            label="Status"
            value={getStatus(courseTask.studentStartDate, courseTask.studentEndDate, score)}
          />
        </Col>
        <Col span={8}>
          <TestCardColumn label="Attempts" value={`${attemptsLeft} left`} />
        </Col>
        <Col span={8}>
          <TestCardColumn label="Score" value={score !== null ? score : <>&ndash;</>} />
        </Col>
      </Row>
    </Card>
  );
}

export default TestCard;
