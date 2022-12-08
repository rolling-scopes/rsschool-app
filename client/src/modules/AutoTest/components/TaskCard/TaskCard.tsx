import { Button, Card, Col, Divider, Row, Tag, Typography } from 'antd';
import React, { useMemo } from 'react';
import { CourseTaskDetailedDto, CourseTaskDetailedDtoTypeEnum } from 'api';
import { SelfEducationPublicAttributes } from 'services/course';
import { parseCourseTask } from 'modules/AutoTest/utils/parseCourseTask';
import getStatusByDate, { AutoTestTaskStatus } from 'modules/AutoTest//utils/getStatusByDate';
import Link from 'next/link';
import { getAutoTestTaskRoute } from 'services/routes';
import { TaskCardColumn, TaskDeadlineDate } from '..';
import { useCourseTaskVerifications } from '../../hooks/useCourseTaskVerifications';
import { Course } from 'services/models';

const { Title, Paragraph } = Typography;

export interface TaskCardProps {
  courseTask: CourseTaskDetailedDto;
  course: Course;
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

function TaskCard({ courseTask: origin, course }: TaskCardProps) {
  const { id, name, studentStartDate, studentEndDate, publicAttributes, type } = parseCourseTask(origin);
  const { maxAttemptsNumber = 0 } = (publicAttributes as SelfEducationPublicAttributes) ?? {};

  const { verifications } = useCourseTaskVerifications(course.id, id);
  const hasExplanation = useMemo(
    () => type === CourseTaskDetailedDtoTypeEnum.Codewars || type === CourseTaskDetailedDtoTypeEnum.Jstask,
    [type],
  );
  const attemptsLeft = useMemo(
    () => maxAttemptsNumber - verifications?.length,
    [maxAttemptsNumber, verifications?.length],
  );

  const score = verifications?.[0]?.score ?? null;

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
            {hasExplanation ? (
              <>
                You can submit your solution as many times as you need before the deadline. Without fines. After the
                deadline, the submission will be closed.
              </>
            ) : null}
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
