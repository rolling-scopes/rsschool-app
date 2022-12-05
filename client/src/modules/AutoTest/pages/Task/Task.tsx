import { useRouter } from 'next/router';
import React, { useContext, useState } from 'react';
import { useAsync } from 'react-use';
import { CoursePageProps } from 'services/models';
import { useLoading } from 'components/useLoading';
import { CoursesTasksApi, CourseTaskDetailedDto } from 'api';
import { Row, Col } from 'antd';
import { PageLayout } from 'components/PageLayout';
import { SessionContext } from 'modules/Course/contexts';

const courseTasksApi = new CoursesTasksApi();

function Task({ course }: CoursePageProps) {
    // TODO: not allowed open the page without proper rights
  const {
    query: { courseTaskId },
  } = useRouter();
  const { githubId } = useContext(SessionContext);
  const [loading, withLoading] = useLoading(false);
  const [courseTask, setCourseTask] = useState<CourseTaskDetailedDto>();

  useAsync(
    withLoading(async () => {
      if (courseTaskId) {
        const { data } = await courseTasksApi.getCourseTask(course.id, Number(courseTaskId));
        setCourseTask(data);
      }
    }),
    [],
  );

  return (
    <PageLayout loading={loading} title="Auto-tests" background="#F0F2F5" githubId={githubId} courseName={course.name}>
      <Row>
        <Col></Col>
      </Row>
    </PageLayout>
  );
}

export default Task;
