import React, { useContext } from 'react';
import { PageLayout } from 'components/PageLayout';
import { CoursePageProps } from 'services/models';
import { SessionContext } from 'modules/Course/contexts';
import { TaskCard } from 'modules/AutoTest/components';
import { Col, Row } from 'antd';
import { CourseTaskDetailedDto } from 'api';
import { ColProps } from 'antd/lib/grid';
import { useCourseTaskVerifications } from 'modules/AutoTest/hooks';

export interface AutoTestsProps extends CoursePageProps {
  courseTasks: CourseTaskDetailedDto[];
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
  const { tasks } = useCourseTaskVerifications(course.id, courseTasks);

  return (
    <PageLayout loading={false} title="Auto-tests" background="#F0F2F5" githubId={githubId} courseName={course.name}>
      <Row gutter={[24, 24]}>
        {tasks?.map(courseTask => (
          <Col {...RESPONSIVE_COLUMNS} key={courseTask.id}>
            <TaskCard courseTask={courseTask} course={course} />
          </Col>
        ))}
      </Row>
    </PageLayout>
  );
}

export default AutoTests;
