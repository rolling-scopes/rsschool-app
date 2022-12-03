import React, { useContext, useMemo, useState } from 'react';
import { PageLayout } from 'components/PageLayout';
import { CoursePageProps } from 'services/models';
import { SessionContext } from 'modules/Course/contexts';
import { TestCard } from '..';
import { Col, message, Row } from 'antd';
import { CourseTaskDetailedDto } from 'api';
import { ColProps } from 'antd/lib/grid';
import { useAsync } from 'react-use';
import { CourseService, Verification } from '../../../../services/course';

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

function getVerificationsByTask(verifications: Verification[], courseTaskId: number): Verification[] {
  return verifications.filter(v => v.courseTaskId === courseTaskId);
}

function AutoTests({ course, courseTasks }: AutoTestsProps) {
  const { githubId } = useContext(SessionContext);
  const courseService = useMemo(() => new CourseService(course.id), []);
  const [verifications, setVerifications] = useState<Verification[]>([]);

  useAsync(async () => {
    try {
      const verifications = await courseService.getTaskVerifications();
      setVerifications(verifications);
    } catch (error) {
      message.error(error);
    }
  }, []);

  return (
    <PageLayout loading={false} title="Auto-tests" background="#F0F2F5" githubId={githubId} courseName={course.name}>
      <Row gutter={[24, 24]}>
        {courseTasks.map(courseTask => (
          <Col {...RESPONSIVE_COLUMNS} key={courseTask.id}>
            <TestCard
              courseTask={courseTask}
              verifications={getVerificationsByTask(verifications, courseTask.id)}
              courseId={course.id}
            />
          </Col>
        ))}
      </Row>
    </PageLayout>
  );
}

export default AutoTests;
