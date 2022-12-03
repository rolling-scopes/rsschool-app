import React, { useContext } from 'react';
import { PageLayout } from 'components/PageLayout';
import { CoursePageProps } from 'services/models';
import { SessionContext } from 'modules/Course/contexts';
import { TestCard } from '..';
import { Col, Row } from 'antd';
import { CourseTaskDto } from 'api';
import { ColProps } from 'antd/lib/grid';

export interface AutoTestsProps extends CoursePageProps {
  courseTasks: CourseTaskDto[];
}

const RESPONSIVE_COLUMNS: ColProps = {
  sm: 24,
  md: 12,
  lg: 8,
  xl: 8,
  xxl: 6,
};

function AutoTests({ course, courseTasks }: AutoTestsProps) {
  const { githubId } = useContext(SessionContext);

  return (
    <PageLayout loading={false} title="Auto-tests" background="#F0F2F5" githubId={githubId} courseName={course.name}>
      <Row gutter={[24, 24]}>
        {courseTasks.map(task => (
          <Col {...RESPONSIVE_COLUMNS} key={task.id}>
            <TestCard {...task} />
          </Col>
        ))}
      </Row>
    </PageLayout>
  );
}

export default AutoTests;
