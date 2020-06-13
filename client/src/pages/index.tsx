import {
  CalendarTwoTone,
  CheckCircleTwoTone,
  CheckSquareTwoTone,
  CodeTwoTone,
  FireTwoTone,
  AudioTwoTone,
  CompassTwoTone,
  // HighlightTwoTone,
  PlayCircleTwoTone,
  StopTwoTone,
  ToolTwoTone,
  UserOutlined,
  StarOutlined,
  QuestionCircleTwoTone,
  CheckSquareOutlined,
  DashboardTwoTone,
} from '@ant-design/icons';
import { Button, Card, Col, Layout, List, Result, Row, Select, Statistic, Tag, Typography } from 'antd';
import { AdminSider, FooterLayout, GithubUserLink, Header, RegistryBanner } from 'components';
import withCourses from 'components/withCourses';
import withSession, { Role, Session } from 'components/withSession';
import { isEmpty, values } from 'lodash';
import * as React from 'react';
import { CourseService, StudentSummary } from 'services/course';
import { Course } from 'services/models';
import { CoursesService } from 'services/courses';
import { MentorRegistryService } from 'services/mentorRegistry';

const { Content } = Layout;

type Props = {
  courses?: Course[];
  session: Session;
};

type State = {
  dropdownOpen: boolean;
  activeCourseId: number | null;
  hasRegistryBanner: boolean;
  collapsed: boolean;
  studentSummary: StudentSummary | null;
  courseTasks: { id: number }[];
  allCourses: Course[];
  preselectedCourses: Course[];
};

const anyAccess = () => true;
const isMentor = (_: Course, role: Role, session: Session) => role === 'mentor' || session.isAdmin;
const isStudent = (_: Course, role: Role, session: Session) => role === 'student' || session.isAdmin;
const isCourseManager = (course: Course, role: Role, session: Session) =>
  role === 'coursemanager' || session.coursesRoles?.[course.id]?.includes('manager');
const isCourseSupervisor = (course: Course, _: Role, session: Session) =>
  session.coursesRoles?.[course.id]?.includes('supervisor');
const isTaskOwner = (course: Course, _: Role, session: Session) =>
  session.coursesRoles?.[course.id]?.includes('taskOwner') ?? false;

const isJuryActivist = (course: Course, _: Role, session: Session) =>
  session.coursesRoles?.[course.id]?.includes('juryActivist') ?? false;

const isAdminRole = (_1: Course, _2: Role, session: Session) => session.isAdmin;
const isCourseNotCompleted = (course: Course) => !course.completed;

const combineAnd = (...checks: any[]) => (course: Course, role: Role, session: Session) =>
  checks.every(check => check(course, role, session));

const combineOr = (...checks: any[]) => (course: Course, role: Role, session: Session) =>
  checks.some(check => check(course, role, session));

const routes = [
  {
    name: () => (
      <>
        <DashboardTwoTone /> Dashboard
      </>
    ),
    getLink: (course: Course) => `/course/student/dashboard?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, isStudent),
  },
  {
    name: () => (
      <>
        <FireTwoTone twoToneColor="orange" /> Score
      </>
    ),
    getLink: (course: Course) => `/course/score?course=${course.alias}`,
    access: anyAccess,
  },
  {
    name: () => (
      <>
        <CalendarTwoTone twoToneColor="#eb2f96" /> Schedule <Tag color="volcano">alpha</Tag>
      </>
    ),
    getLink: (course: Course) => `/course/schedule?course=${course.alias}`,
    access: anyAccess,
  },
  {
    name: () => (
      <>
        <CheckCircleTwoTone twoToneColor="#52c41a" /> Submit Review
      </>
    ),
    getLink: (course: Course) => `/course/mentor/submit-review?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, combineOr(isMentor, isTaskOwner, isAdminRole, isCourseManager)),
  },
  {
    name: () => (
      <>
        <CheckCircleTwoTone /> Submit Review By Jury
      </>
    ),
    getLink: (course: Course) => `/course/mentor/submit-review-jury?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, combineOr(isAdminRole, isJuryActivist)),
  },
  {
    name: () => (
      <>
        <CheckSquareTwoTone twoToneColor="#52c41a" /> Submit Scores
      </>
    ),
    getLink: (course: Course) => `/course/submit-scores?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, combineOr(isTaskOwner, isAdminRole, isCourseManager)),
  },
  // {
  //   name: () => (
  //     <>
  //       <InteractionTwoTone /> Technical Screening
  //     </>
  //   ),
  //   getLink: (course: Course) => `/course/student/stage-interview?course=${course.alias}`,
  //   access: combineAnd(isCourseNotCompleted, isStudent),
  //   newTab: false,
  // },
  {
    name: () => (
      <>
        <CodeTwoTone /> Cross-Check: Submit
      </>
    ),
    getLink: (course: Course) => `/course/student/cross-check-submit?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, isStudent),
  },
  {
    name: () => (
      <>
        <CheckCircleTwoTone twoToneColor="#f56161" /> Cross-Check: Review
      </>
    ),
    getLink: (course: Course) => `/course/student/cross-check-review?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, isStudent),
  },
  {
    name: () => (
      <>
        <AudioTwoTone /> Interviews
      </>
    ),
    getLink: (course: Course) => `/course/student/interviews?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, isStudent),
  },
  {
    name: () => (
      <>
        <AudioTwoTone twoToneColor="orange" /> Interviews
      </>
    ),
    getLink: (course: Course) => `/course/mentor/interviews?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, isMentor),
  },
  {
    name: () => (
      <>
        <CompassTwoTone twoToneColor="#52c41a" /> Cross Mentors
      </>
    ),
    getLink: (course: Course) => `/course/student/cross-mentors?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, isStudent),
  },
  // {
  //   name: () => (
  //     <>
  //       <AudioTwoTone /> Interview: CoreJS
  //     </>
  //   ),
  //   getLink: (course: Course) => `/course/mentor/interview-corejs?course=${course.alias}`,
  //   access: combineAnd(isCourseNotCompleted, isMentor),
  // },
  // {
  //   name: () => (
  //     <>
  //       <InteractionTwoTone /> Stage Interviews
  //     </>
  //   ),
  //   getLink: (course: Course) => `/course/mentor/stage-interviews?course=${course.alias}`,
  //   access: combineAnd(isCourseNotCompleted, isMentor),
  //   newTab: false,
  // },
  // {
  //   name: () => (
  //     <>
  //       <HighlightTwoTone twoToneColor="#7f00ff" /> Interview: Pre-Screening
  //     </>
  //   ),
  //   getLink: (course: Course) => `/course/mentor/interview-technical-screening?course=${course.alias}`,
  //   access: combineAnd(isCourseNotCompleted, isMentor),
  //   newTab: false,
  // },
  {
    name: () => (
      <>
        <PlayCircleTwoTone twoToneColor="#7f00ff" /> Auto-Test
      </>
    ),
    getLink: (course: Course) => `/course/student/auto-test?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, combineOr(isStudent, isCourseManager)),
  },

  // {
  //   name: `🎤 Interview Feedback`,
  //   getLink: (course: Course) => `/course/mentor/interview-feedback?course=${course.alias}`,
  //   access: combine(isCourseNotCompleted, isMentor),
  //   newTab: false,
  // },
  {
    name: () => (
      <>
        <StopTwoTone twoToneColor="red" /> Expel Student
      </>
    ),
    getLink: (course: Course) => `/course/mentor/expel-student?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, isMentor),
  },
];

const courseManagementRoutes = [
  {
    name: () => `Course Events`,
    getLink: (course: Course) => `/course/admin/events?course=${course.alias}`,
    access: combineOr(isAdminRole, isCourseManager),
  },
  {
    name: () => `Course Tasks`,
    getLink: (course: Course) => `/course/admin/tasks?course=${course.alias}`,
    access: combineOr(isAdminRole, isCourseManager),
  },
  {
    name: () => `Course Students`,
    getLink: (course: Course) => `/course/admin/students?course=${course.alias}`,
    access: combineOr(isAdminRole, isCourseManager, isCourseSupervisor),
  },
  {
    name: () => `Course Mentors`,
    getLink: (course: Course) => `/course/admin/mentors?course=${course.alias}`,
    access: combineOr(isAdminRole, isCourseManager, isCourseSupervisor),
  },
  {
    name: () => `Course Users`,
    getLink: (course: Course) => `/course/admin/users?course=${course.alias}`,
    access: isAdminRole,
  },

  {
    name: () => `Technical Screening`,
    getLink: (course: Course) => `/course/admin/stage-interviews?course=${course.alias}`,
    access: combineOr(isAdminRole, isCourseManager, isCourseSupervisor),
  },
];

const mentorRegistryService = new MentorRegistryService();

class IndexPage extends React.PureComponent<Props, State> {
  state: State = {
    dropdownOpen: false,
    activeCourseId: null,
    hasRegistryBanner: false,
    collapsed: false,
    studentSummary: null,
    courseTasks: [],
    allCourses: [],
    preselectedCourses: [],
  };

  toggle = () => {
    this.setState({ collapsed: !this.state.collapsed });
  };

  private getLinks = (course: Course) => {
    if (!this.props.session) {
      return [];
    }

    const role = this.props.session.roles[course.id];
    return routes
      .filter(route => route.access(course, role, this.props.session))
      .map(route => ({
        name: route.name(),
        link: route.getLink(course),
      }));
  };

  private getCourseManagementLinks = (course: Course) => {
    if (!this.props.session) {
      return [];
    }

    const role = this.props.session.roles[course.id];
    return courseManagementRoutes
      .filter(route => route.access(course, role, this.props.session))
      .map(route => ({
        name: route.name(),
        link: route.getLink(course),
      }));
  };

  private getCourses() {
    const { session, courses } = this.props;
    if (!session || !courses) {
      return [];
    }
    const { isAdmin } = session;
    // TODO: it seems no need to filter. It is done on the server already.
    return courses
      .filter(course => isAdmin || session.roles[course.id] || !isEmpty(session.coursesRoles?.[course.id]))
      .filter(course => !(!isAdmin && course.alias === 'epamlearningjs' && session.roles[course.id] === 'student'))
      .sort((a, b) => (a.startDate && b.startDate ? b.startDate.localeCompare(a.startDate) : 0));
  }

  private getActiveCourse() {
    const courses = this.getCourses();
    if (courses.length === 0) {
      return null;
    }
    const savedActiveCourseId = localStorage.getItem('activeCourseId');
    const activeCourseId = this.state.activeCourseId || Number(savedActiveCourseId);
    const course = courses.find(course => course.id === activeCourseId);
    if (course) {
      return course;
    }
    return courses[0];
  }

  private getStatus = (course: Course) => {
    if (course.completed) {
      return 'Completed';
    }
    if (course.planned) {
      return 'Planned';
    }
    return 'Active';
  };

  async componentDidMount() {
    const wasMentor = Object.values(this.props.session.roles).some(v => v === 'mentor');

    const plannedCourses = (this.props.courses || []).filter(course => course.planned && !course.inviteOnly);
    const hasRegistryBanner =
      wasMentor &&
      plannedCourses.length > 0 &&
      plannedCourses.every(course => this.props.session.roles[course.id] == null);
    this.setState({ hasRegistryBanner });
    const activeCourse = this.getActiveCourse();
    const [allCourses] = await Promise.all([new CoursesService().getCourses(), this.loadCourseData(activeCourse?.id)]);
    this.setState({ allCourses });
    if (!activeCourse) {
      const mentor = await mentorRegistryService.getMentor();
      const preselectedCourses = allCourses.filter(c => mentor.preselectedCourses.includes(c.id));
      this.setState({ preselectedCourses });
    }
  }

  renderNoCourse() {
    const hasPlanned = this.state.allCourses?.some(course => course.planned && !course.completed);
    return (
      <Result
        icon={<QuestionCircleTwoTone twoToneColor="#52c41a" />}
        title="You are not student or mentor in any active course"
        subTitle={
          <div>
            <span>
              {hasPlanned
                ? 'You can register to the upcoming course.'
                : 'Unfortunately, there are no any planned courses for students but you can always register as mentor'}
              <Button target="_blank" size="small" type="link" href="https://docs.rs.school/#/how-to-enroll">
                More info
              </Button>
            </span>
          </div>
        }
        extra={
          <>
            <Row justify="center">
              <Button size="large" icon={<StarOutlined />} type="default" href="/registry/mentor">
                Register as Mentor
              </Button>
              {hasPlanned && (
                <Button
                  style={{ marginLeft: 16 }}
                  size="large"
                  icon={<UserOutlined />}
                  href="/registry/student"
                  type="default"
                >
                  Register as Student
                </Button>
              )}
            </Row>
            <Row justify="center" style={{ marginTop: 16 }}>
              {this.state.preselectedCourses.map(c => {
                return (
                  <Button
                    key={c.id}
                    size="large"
                    icon={<CheckSquareOutlined />}
                    type="primary"
                    href={`/course/mentor/confirm?course=${c.alias}`}
                  >
                    Confirm {c.name}
                  </Button>
                );
              })}
            </Row>
          </>
        }
      />
    );
  }

  private handleChange = async (courseId: number) => {
    localStorage.setItem('activeCourseId', courseId as any);
    this.setState({ activeCourseId: courseId });
    await this.loadCourseData(courseId);
  };

  private async loadCourseData(courseId?: number) {
    this.setState({ studentSummary: null });
    if (courseId && this.props.session.roles[courseId] === 'student') {
      const courseService = new CourseService(courseId);
      const [studentSummary, courseTasks] = await Promise.all([
        courseService.getStudentSummary('me'),
        courseService.getCourseTasks(),
      ]);
      this.setState({ studentSummary, courseTasks: courseTasks.map(t => ({ id: t.id })) });
    }
  }

  render() {
    const { isAdmin, coursesRoles } = this.props.session;
    const isCourseManager = values(coursesRoles).some(item => item?.includes('manager'));
    const activeCourse = this.getActiveCourse();
    const courses = this.getCourses();
    return (
      <div>
        <Layout style={{ minHeight: '100vh' }}>
          {(isAdmin || isCourseManager) && <AdminSider isAdmin={isAdmin} isCourseManager={isCourseManager} />}

          <Layout style={{ background: '#fff' }}>
            <Header username={this.props.session.githubId} />
            <Content style={{ margin: 16, marginBottom: 32 }}>
              {!activeCourse && this.renderNoCourse()}
              {this.renderRegistryBanner(activeCourse)}
              {this.renderCourseSelect(activeCourse, courses)}
              <Row gutter={24}>
                <Col xs={24} sm={12} md={10} lg={8} style={{ marginBottom: 16 }}>
                  {this.renderCourseLinks(activeCourse)}
                </Col>
                <Col xs={24} sm={12} md={12} lg={16}>
                  {this.renderSummmary(this.state.studentSummary)}
                </Col>
              </Row>
            </Content>
            <FooterLayout />
          </Layout>
        </Layout>
      </div>
    );
  }

  private renderRegistryBanner(course: Course | null) {
    if (!course || !this.state.hasRegistryBanner) {
      return null;
    }
    return (
      <div style={{ margin: '16px 0' }}>
        <RegistryBanner />
      </div>
    );
  }

  private renderCourseSelect(course: Course | null, courses: Course[]) {
    if (!course) {
      return null;
    }
    return (
      <Select style={{ width: 250, marginBottom: 16 }} defaultValue={course.id} onChange={this.handleChange}>
        {courses.map(course => (
          <Select.Option key={course.id} value={course.id}>
            {course.name} ({this.getStatus(course)})
          </Select.Option>
        ))}
      </Select>
    );
  }

  private renderCourseLinks(course: Course | null) {
    if (!course) {
      return null;
    }
    const courseManagementLinks = this.getCourseManagementLinks(course);
    return (
      <>
        <List
          size="small"
          bordered
          dataSource={this.getLinks(course)}
          renderItem={(linkInfo: LinkInfo) => (
            <List.Item key={linkInfo.link}>
              <a target={linkInfo.newTab ? '_blank' : '_self'} href={linkInfo.link}>
                {linkInfo.name}
              </a>
            </List.Item>
          )}
        />
        {courseManagementLinks.length ? (
          <List
            size="small"
            style={{ marginTop: 16 }}
            header={
              <>
                <ToolTwoTone twoToneColor="#000000" />
                <Typography.Text strong> Course Management</Typography.Text>
              </>
            }
            bordered
            dataSource={courseManagementLinks}
            renderItem={(linkInfo: LinkInfo) => (
              <List.Item key={linkInfo.link}>
                <a target={linkInfo.newTab ? '_blank' : '_self'} href={linkInfo.link}>
                  {linkInfo.name}
                </a>
              </List.Item>
            )}
          />
        ) : null}
      </>
    );
  }

  private renderSummmary(summary: StudentSummary | null) {
    if (!summary) {
      return null;
    }
    const { name, githubId, contactsEmail, contactsPhone, contactsSkype, contactsTelegram, contactsNotes } =
      summary.mentor ?? {};
    const tasksCount = summary.results.filter(r => r.score > 0).length;
    const courseTasks = this.state.courseTasks;
    const totalTaskCount = courseTasks.length;
    return (
      <>
        <Row gutter={24}>
          <Col xs={24} sm={24} md={24} lg={12}>
            <Card style={{ marginBottom: 16 }} size="small" title="Your stats">
              <Row>
                <Col span={12}>
                  <Statistic title="Score Points" value={summary.totalScore} />
                </Col>
                <Col span={12}>
                  <Statistic title="Completed Tasks" value={`${tasksCount}/${totalTaskCount}`} />
                </Col>
                <Col span={24} style={{ marginTop: 16 }}>
                  <Statistic
                    title="Status"
                    valueStyle={{ color: summary.isActive ? '#87d068' : '#ff5500' }}
                    value={summary.isActive ? 'Active' : 'Inactive'}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
          {summary.mentor && (
            <Col xs={24} sm={24} md={24} lg={12}>
              <Card size="small" title="Your mentor">
                <div>
                  <div>{name}</div>
                  <div>
                    <GithubUserLink value={githubId!} />
                  </div>
                </div>
                {this.renderContact('Email', contactsEmail)}
                {this.renderContact('Phone', contactsPhone)}
                {this.renderContact('Skype', contactsSkype)}
                {this.renderContact('Telegram', contactsTelegram)}
                {this.renderContact('Notes', contactsNotes)}
              </Card>
            </Col>
          )}
        </Row>
      </>
    );
  }

  private renderContact(label: string, value?: string) {
    if (!value) {
      return null;
    }
    return (
      <p>
        <Typography.Text type="secondary">{label}:</Typography.Text> {value}
      </p>
    );
  }
}

type LinkInfo = { name: React.ReactNode; link: string; newTab?: boolean };

export default withCourses(withSession(IndexPage));
