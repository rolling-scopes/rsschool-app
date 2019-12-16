import { Button, List, Select, Result, Layout, Icon, Row, Col, Statistic, Card, Typography, Tag } from 'antd';
import { Header, RegistryBanner, AdminSider, FooterLayout, GithubUserLink } from 'components';
import withCourses from 'components/withCourses';
import withSession, { Role, Session } from 'components/withSession';
import * as React from 'react';
import { Course, CourseService, StudentSummary } from 'services/course';
import { isEmpty } from 'lodash';
import '../styles/main.scss';

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
};

const anyAccess = () => true;
const isMentor = (_: Course, role: Role, session: Session) => role === 'mentor' || session.isAdmin;
const isStudent = (_: Course, role: Role, session: Session) => role === 'student' || session.isAdmin;
const isCourseManager = (course: Course, role: Role, session: Session) =>
  role === 'coursemanager' || session.coursesRoles?.[course.id]?.includes('manager');
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
        <Icon type="fire" theme="twoTone" twoToneColor="orange" /> Score
      </>
    ),
    getLink: (course: Course) => `/course/score?course=${course.alias}`,
    access: anyAccess,
    newTab: false,
  },
  {
    name: () => (
      <>
        <Icon type="calendar" theme="twoTone" twoToneColor="#eb2f96" /> Schedule <Tag color="volcano">alpha</Tag>
      </>
    ),
    getLink: (course: Course) => `/course/schedule?course=${course.alias}`,
    access: anyAccess,
    newTab: false,
  },
  {
    name: () => (
      <>
        <Icon type="check-circle" theme="twoTone" twoToneColor="#52c41a" /> Submit Review
      </>
    ),
    getLink: (course: Course) => `/course/mentor/submit-review?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, combineOr(isMentor, isTaskOwner, isAdminRole)),
    newTab: false,
  },
  {
    name: () => (
      <>
        <Icon type="check-circle" theme="twoTone" /> Submit Review By Jury
      </>
    ),
    getLink: (course: Course) => `/course/mentor/submit-review-jury?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, combineOr(isAdminRole, isJuryActivist)),
    newTab: false,
  },
  {
    name: () => (
      <>
        <Icon type="check-square" theme="twoTone" twoToneColor="#52c41a" /> Submit Scores
      </>
    ),
    getLink: (course: Course) => `/course/task-owner/submit-scores?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, combineOr(isTaskOwner, isAdminRole)),
    newTab: false,
  },
  {
    name: () => (
      <>
        <Icon type="interaction" theme="twoTone" /> Stage Interview
      </>
    ),
    getLink: (course: Course) => `/course/student/stage-interview?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, isStudent),
    newTab: false,
  },
  {
    name: () => (
      <>
        <Icon type="code" twoToneColor="#f56161" theme="twoTone" /> Cross-Check: Submit
      </>
    ),
    getLink: (course: Course) => `/course/student/task-solution?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, isStudent),
    newTab: false,
  },
  {
    name: () => (
      <>
        <Icon type="check-circle" twoToneColor="#f56161" theme="twoTone" /> Cross-Check: Review
      </>
    ),
    getLink: (course: Course) => `/course/student/cross-check?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, isStudent),
    newTab: false,
  },
  {
    name: () => (
      <>
        <Icon type="interaction" theme="twoTone" /> Stage Interviews
      </>
    ),
    getLink: (course: Course) => `/course/mentor/stage-interviews?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, isMentor),
    newTab: false,
  },
  {
    name: () => (
      <>
        <Icon type="highlight" theme="twoTone" twoToneColor="#7f00ff" /> Stage Interview Feedback
      </>
    ),
    getLink: (course: Course) => `/course/mentor/stage-interview-feedback?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, isMentor),
    newTab: false,
  },
  {
    name: () => (
      <>
        <Icon type="play-circle" theme="twoTone" twoToneColor="#7f00ff" /> Auto-Test: Submit
      </>
    ),
    getLink: (course: Course) => `/course/submit-task?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, isStudent),
    newTab: false,
  },
  {
    name: () => (
      <>
        <Icon type="dashboard" theme="twoTone" twoToneColor="#7f00ff" /> Auto-Test: Verification Status
      </>
    ),
    getLink: (course: Course) => `/course/tasks-verifications?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, isStudent),
    newTab: false,
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
        <Icon type="stop" theme="twoTone" twoToneColor="red" /> Expel Student
      </>
    ),
    getLink: (course: Course) => `/course/mentor/expel?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, isMentor),
    newTab: false,
  },
];

const courseManagementRoutes = [
  {
    name: () => `Course Events`,
    getLink: (course: Course) => `/course/admin/events?course=${course.alias}`,
    access: isAdminRole,
    newTab: false,
  },
  {
    name: () => `Course Tasks`,
    getLink: (course: Course) => `/course/admin/tasks?course=${course.alias}`,
    access: isAdminRole,
    newTab: false,
  },
  {
    name: () => `Course Students`,
    getLink: (course: Course) => `/course/admin/students?course=${course.alias}`,
    access: combineOr(isAdminRole, isCourseManager),
    newTab: false,
  },
  {
    name: () => `Course Mentors`,
    getLink: (course: Course) => `/course/admin/mentors?course=${course.alias}`,
    access: combineOr(isAdminRole, isCourseManager),
    newTab: false,
  },
  {
    name: () => `Course Users`,
    getLink: (course: Course) => `/course/admin/users?course=${course.alias}`,
    access: isAdminRole,
    newTab: false,
  },
];

class IndexPage extends React.PureComponent<Props, State> {
  state: State = {
    dropdownOpen: false,
    activeCourseId: null,
    hasRegistryBanner: false,
    collapsed: false,
    studentSummary: null,
    courseTasks: [],
  };

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
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
        newTab: route.newTab,
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
        newTab: route.newTab,
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
      .filter(course => !(course.alias === 'epamlearningjs' && session.roles[course.id] === 'student'))
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

    const plannedCourses = (this.props.courses || []).filter(course => course.planned);
    const hasRegistryBanner =
      wasMentor &&
      plannedCourses.length > 0 &&
      plannedCourses.every(course => this.props.session.roles[course.id] == null);
    this.setState({ hasRegistryBanner });
    const activeCourse = this.getActiveCourse();
    await this.loadCourseData(activeCourse?.id);
  }

  renderNoCourse() {
    const hasPlanned = (this.props.courses || []).some(course => course.planned && !course.completed);
    return (
      <Result
        status="info"
        title="You are not student or mentor in any active course"
        subTitle={
          hasPlanned
            ? 'You can register to the upcoming course.'
            : 'Unfortunately, there are no any planned courses for students but you can always register as mentor'
        }
        extra={
          <>
            <Button type="primary" href="/registry/mentor">
              Register as Mentor
            </Button>
            {hasPlanned && (
              <Button href="/registry/student" type="primary">
                Register as Student
              </Button>
            )}
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
    const { isAdmin } = this.props.session;
    const activeCourse = this.getActiveCourse();
    const courses = this.getCourses();
    return (
      <div>
        <Layout style={{ minHeight: '100vh' }}>
          {isAdmin && <AdminSider />}

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
      <div className="mb-3">
        <RegistryBanner />
      </div>
    );
  }

  private renderCourseSelect(course: Course | null, courses: Course[]) {
    if (!course) {
      return null;
    }
    return (
      <Select style={{ width: 250 }} className="mb-2" defaultValue={course.id} onChange={this.handleChange}>
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
                <Icon type="tool" theme="twoTone" twoToneColor="#000000" />
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
                <p>
                  <div>{name}</div>
                  <div>
                    <GithubUserLink value={githubId!} />
                  </div>
                </p>
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

type LinkInfo = { name: React.ReactNode; link: string; newTab: boolean };

export default withCourses(withSession(IndexPage));
