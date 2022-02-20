import { ToolTwoTone } from '@ant-design/icons';
import { Alert, Button, Col, Layout, List, Row, Select, Typography } from 'antd';
import type { AlertDto } from 'api';
// import { AdminSider } from 'components/AdminSider';
import { FooterLayout } from 'components/Footer';
import { Header } from 'components/Header';
import { Session } from 'components/withSession';
// import { isAdmin, isAnyCoursePowerUser, isAnyMentor, isHirer } from 'domain/user';
import { isAnyMentor } from 'domain/user';
import { HomeSummary } from 'modules/Home/components/HomeSummary';
import { NoCourse } from 'modules/Home/components/NoCourse';
import { RegistryBanner } from 'modules/Home/components/RegistryBanner';
import { SystemAlerts } from 'modules/Home/components/SystemAlerts';
import { getAdminLinks, getCourseLinks } from 'modules/Home/data/links';
import { useActiveCourse } from 'modules/Home/hooks/useActiveCourse';
import { useStudentSummary } from 'modules/Home/hooks/useStudentSummary';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { AlertsService } from 'services/alerts';
import { CoursesService } from 'services/courses';
import { MentorRegistryService } from 'services/mentorRegistry';
import { Course } from 'services/models';

const { Content } = Layout;

type Props = {
  courses?: Course[];
  session: Session;
};

const mentorRegistryService = new MentorRegistryService();

export function HomePage(props: Props) {
  const plannedCourses = (props.courses || []).filter(course => course.planned && !course.inviteOnly);
  const wasMentor = isAnyMentor(props.session);
  const hasRegistryBanner =
    wasMentor && plannedCourses.length > 0 && plannedCourses.every(course => props.session.courses[course.id] == null);

  // const isAdminUser = isAdmin(props.session);
  // const isPowerUser = isAnyCoursePowerUser(props.session);
  // const isHirerUser = isHirer(props.session);

  const courses = props.courses ?? [];
  const [activeCourse, saveActiveCouseId] = useActiveCourse(courses);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [preselectedCourses, setPreselectedCourses] = useState<Course[]>([]);
  const [alerts, setAlerts] = useState<AlertDto[]>([]);

  const courseLinks = useMemo(() => getCourseLinks(props.session, activeCourse), [activeCourse]);
  const adminLinks = useMemo(() => getAdminLinks(props.session, activeCourse), [activeCourse]);

  const [approvedCourse] = preselectedCourses.filter(course => !props.session.courses?.[course.id]);

  useAsync(async () => setAlerts(await new AlertsService().getAll()));

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

  const { courseTasks, studentSummary } = useStudentSummary(props.session, activeCourse);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout style={{ background: '#fff' }}>
        <Header username={props.session.githubId} />
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

          {activeCourse && (
            <Select
              showSearch
              optionFilterProp="children"
              style={{ width: 250, marginBottom: 16 }}
              defaultValue={activeCourse.id}
              onChange={saveActiveCouseId}
            >
              {courses.map(course => (
                <Select.Option key={course.id} value={course.id}>
                  {course.name} ({getStatus(course)})
                </Select.Option>
              ))}
            </Select>
          )}

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
                        <a>
                          {linkInfo.icon} {linkInfo.name}
                        </a>
                      </Link>
                    </List.Item>
                  )}
                />
              ) : null}

              {adminLinks.length ? (
                <List
                  size="small"
                  style={{ marginTop: 16 }}
                  header={
                    <Typography.Text strong>
                      <ToolTwoTone twoToneColor="#000000" /> Course Management
                    </Typography.Text>
                  }
                  bordered
                  dataSource={adminLinks}
                  renderItem={linkInfo => (
                    <List.Item key={linkInfo.url}>
                      <Link prefetch={false} href={linkInfo.url}>
                        <a>
                          {linkInfo.icon} {linkInfo.name}
                        </a>
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
        <FooterLayout />
      </Layout>
    </Layout>
  );
}

const getStatus = (course: Course) => {
  if (course.completed) {
    return 'Completed';
  }
  if (course.planned) {
    return 'Planned';
  }
  return 'Active';
};
