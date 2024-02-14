import { Alert, Button, Col, Flex, Image, Layout, List, Modal, Row, Typography } from 'antd';
import { AlertDto, AlertsApi } from 'api';
import { AdminSider } from 'components/Sider/AdminSider';
import { FooterLayout } from 'components/Footer';
import { Header } from 'components/Header';
import { isAdmin, isAnyCourseDementor, isAnyCoursePowerUser, isAnyMentor } from 'domain/user';
import { HomeSummary } from 'modules/Home/components/HomeSummary';
import { NoCourse } from 'modules/Home/components/NoCourse';
import { CourseSelector } from 'modules/Home/components/CourseSelector';
import { RegistryBanner } from 'modules/Home/components/RegistryBanner';
import { SystemAlerts } from 'modules/Home/components/SystemAlerts';
import { getCourseLinks } from 'modules/Home/data/links';
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
  const { courses = [], setCourse, course } = useActiveCourseContext();
  const session = useContext(SessionContext);

  // Dima's birthday modal
  // TODO: remove after 14.02.2023
  const isDima = useMemo(() => session?.githubId === 'dzmitry-varabei', [session]);
  const [isModalVisible, setIsModalVisible] = useState(isDima);

  const plannedCourses = (courses || []).filter(course => course.planned && !course.inviteOnly);
  const wasMentor = isAnyMentor(session);
  const hasRegistryBanner =
    !isAdmin(session) &&
    wasMentor &&
    plannedCourses.length > 0 &&
    plannedCourses.every(course => session.courses[course.id] == null);

  const isPowerUser = isAnyCoursePowerUser(session) || isAnyCourseDementor(session);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [preselectedCourses, setPreselectedCourses] = useState<Course[]>([]);
  const [alerts, setAlerts] = useState<AlertDto[]>([]);

  const courseLinks = useMemo(() => getCourseLinks(session, course), [course]);
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

  const handleChangeCourse = (courseId: number) => {
    const course = courses.find(course => {
      return course.id === courseId;
    });
    if (course) {
      setCourse(course);
    }
  };

  const { courseTasks, studentSummary } = useStudentSummary(session, course);

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Header />
      {/*will remove after 14.02.2023*/}
      {isModalVisible && (
        <Modal
          title="Happy Birthday, Dima!"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onOk={() => setIsModalVisible(false)}
        >
          <Flex align="center" vertical gap={'small'}>
            <Typography.Text strong>🎉 Поздравляем С Днём Рождения, Дима! 🎉</Typography.Text>
            <Typography.Text>От команды разработчиков RS App и всех в Rolling Scopes Community,</Typography.Text>
            <Typography.Text>
              Сегодня мы отмечаем не просто день, а эпоху – <br />
              Эру Димы, величайшего менеджера и лидера!
            </Typography.Text>
            <Typography.Text>
              Ты как гуру JavaScript в мире управления, <br />
              С тобой каждый баг превращается в feature, <br />
              Каждый дедлайн – в новое приключение, <br />И каждое совещание – в комедийное шоу!
            </Typography.Text>
            <Typography.Text>
              Ты не просто руководишь – ты вдохновляешь, <br />
              Не просто планируешь – ты создаёшь искусство, <br />
              Не просто общаешься – а заставляешь нас смеяться, <br />И делаешь каждый рабочий день чем-то особенным.
            </Typography.Text>
            <Typography.Text>
              Сегодня мы отмечаем не только твой день рождения, <br />
              Но и день, когда RS App и Rolling Scopes получили своего героя. <br />
              С днём рождения, Дима! Оставайся всегда таким же крутым, <br />И пусть каждый твой код коммит будет без
              конфликтов!
            </Typography.Text>
            <Typography.Text strong>С уважением и лучшими пожеланиями, Команда RS App 🎉🎈🎂</Typography.Text>
            <Image src={`/static/images/dima.jpg`} alt={'dima'} width={300} height={300} />
          </Flex>
        </Modal>
      )}
      <Layout style={{ background: '#fff' }}>
        {isPowerUser && <AdminSider courses={courses} activeCourse={course} />}
        <Content style={{ margin: 16, marginBottom: 32 }}>
          {!course && <NoCourse courses={allCourses} preselectedCourses={preselectedCourses} />}

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

          <CourseSelector course={course} onChangeCourse={handleChangeCourse} courses={courses} />

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
