import { Alert, Button, Col, Layout, List, Row } from 'antd';
import { AlertDto, AlertsApi } from 'api';
import { AdminSider } from 'components/Sider/AdminSider';
import { FooterLayout } from 'components/Footer';
import { Header } from 'components/Header';
import { isAnyCourseDementor, isAnyCoursePowerUser, isAnyMentor } from 'domain/user';
import { HomeSummary } from 'modules/Home/components/HomeSummary';
import { NoCourse } from 'modules/Home/components/NoCourse';
import { CourseSelector } from 'modules/Home/components/CourseSelector';
import { RegistryBanner } from 'modules/Home/components/RegistryBanner';
import { SystemAlerts } from 'modules/Home/components/SystemAlerts';
import { getCourseLinks } from 'modules/Home/data/links';
import { useActiveCourse } from 'modules/Home/hooks/useActiveCourse';
import { useStudentSummary } from 'modules/Home/hooks/useStudentSummary';
import Link from 'next/link';
import { useMemo, useState, useContext } from 'react';
import { useAsync } from 'react-use';
import { CoursesService } from 'services/courses';
import { MentorRegistryService } from 'services/mentorRegistry';
import { Course } from 'services/models';
import { SessionContext, useActiveCourseContext } from 'modules/Course/contexts';

const { Content } = Layout;

const mentorRegistryService = new MentorRegistryService();
const alertService = new AlertsApi();

export function HomePage() {
  const { courses = [] } = useActiveCourseContext();
  const session = useContext(SessionContext);
  const plannedCourses = (courses || []).filter(course => course.planned && !course.inviteOnly);
  const wasMentor = isAnyMentor(session);
  const hasRegistryBanner =
    wasMentor && plannedCourses.length > 0 && plannedCourses.every(course => session.courses[course.id] == null);

  const isPowerUser = isAnyCoursePowerUser(session) || isAnyCourseDementor(session);

  const [activeCourse, saveActiveCourseId] = useActiveCourse(courses);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [preselectedCourses, setPreselectedCourses] = useState<Course[]>([]);
  const [alerts, setAlerts] = useState<AlertDto[]>([]);

  const courseLinks = useMemo(() => getCourseLinks(session, activeCourse), [activeCourse]);
  const [approvedCourse] = preselectedCourses.filter(course => !session.courses?.[course.id]);

  useAsync(async () => {
    const { data } = await alertService.getAlerts(true);
    setAlerts(data);
  });

  useAsync(async () => {
    const mentor = await mentorRegistryService.getMentor().catch(() => null);
    if (mentor == null) {
      return;
    }
    const allCourses = await new CoursesService().getCourses();
    const preselectedCourses = allCourses.filter(c => mentor?.preselectedCourses.includes(c.id));
    setAllCourses(allCourses);
    setPreselectedCourses(preselectedCourses);
  });

  const { courseTasks, studentSummary } = useStudentSummary(session, activeCourse);

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Header />
      <Layout style={{ background: '#fff' }}>
        {isPowerUser && <AdminSider courses={courses} activeCourse={activeCourse} />}
        <Content style={{ margin: 16, marginBottom: 32 }}>
          {!activeCourse && <NoCourse courses={allCourses} preselectedCourses={preselectedCourses} />}

          {approvedCourse && (
            <div style={{ margin: '16px 0' }}>
              <Alert
                type="success"
                showIcon
                message={`You are approved as a mentor to "${approvedCourse.name}" course`}
                description={
                  <Button type="primary" href={`/course/mentor/confirm?course=${approvedCourse.alias}`}>
                    Confirm Participation
                  </Button>
                }
              />
            </div>
          )}

          <SystemAlerts alerts={alerts} />

          {hasRegistryBanner && <RegistryBanner style={{ margin: '16px 0' }} />}

          <CourseSelector course={activeCourse} onChangeCourse={saveActiveCourseId} courses={courses} />

          <Row gutter={24}>
            <Col xs={24} sm={12} md={10} lg={8} style={{ marginBottom: 16 }}>
              {courseLinks.length ? (
                <List
                  size="small"
                  bordered
                  dataSource={courseLinks}
                  renderItem={linkInfo => (
                    <List.Item key={linkInfo.url}>
                      <Link prefetch={false} href={linkInfo.url}>
                        {linkInfo.icon} {linkInfo.name}
                      </Link>
                    </List.Item>
                  )}
                />
              ) : null}
            </Col>
            <Col xs={24} sm={12} md={12} lg={16}>
              {studentSummary && <HomeSummary courseTasks={courseTasks} summary={studentSummary} />}
            </Col>
          </Row>
        </Content>
      </Layout>
      <FooterLayout />
    </Layout>
  );
}
