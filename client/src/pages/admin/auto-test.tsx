import { Col, ColProps, Row } from 'antd';
import { AutoTestTaskDto, AutoTestsApi } from 'api';
import { AdminPageLayout } from 'components/PageLayout';
import { TaskCard } from 'modules/AutoTest/components';
import AutoTestTaskCard from 'modules/AutoTest/components/AutoTestTaskCard/AutoTestTaskCard';
import { ActiveCourseProvider, SessionProvider, useActiveCourseContext } from 'modules/Course/contexts';
import { useEffect, useState } from 'react';
import { CourseRole } from 'services/models';

const style = {
    background: '#0092ff',
    padding: '8px 0',
  };

  const RESPONSIVE_COLUMNS: ColProps = {
    sm: 24,
    md: 12,
    lg: 8,
    xl: 8,
    xxl: 6,
  };
  
function Page() {
  const { courses } = useActiveCourseContext();
  const [tests, setTests] = useState<AutoTestTaskDto[]>([]);
  useEffect(() => {
    const api = new AutoTestsApi();
    api.getAllRSSchoolAppTests().then(tests => setTests(tests.data));
  }, []);
  return (
    <AdminPageLayout title="Manage Discord Servers" loading={false} courses={courses}>
      <Row gutter={[24, 24]} style={{ padding: '0 16px', marginRight: 0 }}>
        {tests.map(courseTask => (
          <Col {...RESPONSIVE_COLUMNS} key={courseTask.id}>
            <AutoTestTaskCard courseTask={courseTask} course={courseTask.courses[0]} />
          </Col>
        ))}
        </Row>
      {tests.length ? <pre>{JSON.stringify(tests, null, 4)}</pre> : <h1>no any tests</h1>}
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
