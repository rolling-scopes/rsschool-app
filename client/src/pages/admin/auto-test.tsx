import { Col, ColProps, Row, message } from 'antd';
import { AutoTestsApi, BasicAutoTestTaskDto } from 'api';
import { AdminPageLayout } from 'components/PageLayout';
import AutoTestTaskCard from 'modules/AutoTest/components/AutoTestTaskCard/AutoTestTaskCard';
import { ActiveCourseProvider, SessionProvider, useActiveCourseContext } from 'modules/Course/contexts';
import { useState } from 'react';
import { useAsync } from 'react-use';
import { CourseRole } from 'services/models';

const RESPONSIVE_COLUMNS: ColProps = {
  sm: 24,
  md: 12,
  lg: 8,
  xl: 8,
  xxl: 6,
};

const api = new AutoTestsApi();

function Page() {
  const { courses } = useActiveCourseContext();
  const [tests, setTests] = useState<BasicAutoTestTaskDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useAsync(async () => {
    try {
      setIsLoading(true);
      const resp = await api.getBasicAutoTests();
      setTests(resp.data);
      setIsLoading(false);
    } catch (e) {
      message.error('Something went wrong. Please try again later.');
    }
  });

  return (
    <AdminPageLayout title="Auto test tasks" loading={isLoading} courses={courses}>
      <Row gutter={[24, 24]} style={{ padding: '0 16px', marginRight: 0 }}>
        {tests.map(courseTask => (
          <Col {...RESPONSIVE_COLUMNS} key={courseTask.id}>
            <AutoTestTaskCard courseTask={courseTask} />
          </Col>
        ))}
      </Row>
    </AdminPageLayout>
  );
}
export default function () {
  return (
    <ActiveCourseProvider>
      <SessionProvider allowedRoles={[CourseRole.Manager]} adminOnly>
        <Page />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}
