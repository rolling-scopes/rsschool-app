import { Button, List, Select, Result, Row, Col, Layout } from 'antd';
import { Header, RegistryBanner, Feedback, Help, AdminSider } from 'components';
import withCourses from 'components/withCourses';
import withSession, { Role, Session } from 'components/withSession';
import * as React from 'react';
import { Course } from 'services/course';
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
};

const anyAccess = () => true;
const isMentor = (_: Course, role: Role, session: Session) => role === 'mentor' || session.isAdmin;
const isStudent = (_: Course, role: Role, session: Session) => role === 'student' || session.isAdmin;
const isCourseManager = (_1: Course, role: Role, _2: Session) => role === 'coursemanager';
const isTaskOwner = (course: Course, _: Role, session: Session) =>
  session.courseRoles &&
  session.courseRoles.taskOwnerRole &&
  session.courseRoles.taskOwnerRole.courses.some(({ id }) => id === course.id);

// const isActivist = (_1: Course, _2: Role, session: Session) => session.isActivist;

const isAdminRole = (_1: Course, _2: Role, session: Session) => session.isAdmin;
const isCourseNotCompleted = (course: Course) => !course.completed;

const combineAnd = (...checks: any[]) => (course: Course, role: Role, session: Session) =>
  checks.every(check => check(course, role, session));

const combineOr = (...checks: any[]) => (course: Course, role: Role, session: Session) =>
  checks.some(check => check(course, role, session));

const routes = [
  {
    name: `🔥 Score`,
    getLink: (course: Course) => `/course/score?course=${course.alias}`,
    access: anyAccess,
    newTab: false,
  },
  {
    name: `🗓 Schedule`,
    getLink: (course: Course) => `/course/schedule?course=${course.alias}`,
    access: anyAccess,
    newTab: false,
  },
  {
    name: `✅ Submit Review`,
    getLink: (course: Course) => `/course/mentor/submit-review?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, isMentor),
    newTab: false,
  },
  {
    name: `📝 Submit Scores`,
    getLink: (course: Course) => `/course/task-owner/submit-scores?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, isTaskOwner),
    newTab: false,
  },
  {
    name: `🎤 Stage Interview`,
    getLink: (course: Course) => `/course/student/stage-interview?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, isStudent),
    newTab: false,
  },
  {
    name: `🎤 Stage Interviews`,
    getLink: (course: Course) => `/course/mentor/stage-interviews?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, isMentor),
    newTab: false,
  },
  {
    name: `🚀 Submit Task`,
    getLink: (course: Course) => `/course/submit-task?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, isStudent),
    newTab: false,
  },
  {
    name: `🚦 Task Verification Status`,
    getLink: (course: Course) => `/course/tasks-verifications?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, isStudent),
    newTab: false,
  },
  // {
  //   name: `👨‍🏫 Rate Task By Jury`,
  //   getLink: (course: Course) => `/course/rate-task-jury?course=${course.alias}`,
  //   access: combineAnd(isCourseNotCompleted, combineOr(isAdminRole, isActivist, isCourseManager)),
  //   newTab: false,
  // },

  // {
  //   name: `🎤 Interview Feedback`,
  //   getLink: (course: Course) => `/course/mentor/interview-feedback?course=${course.alias}`,
  //   access: combine(isCourseNotCompleted, isMentor),
  //   newTab: false,
  // },
  {
    name: `😞 Expel Student`,
    getLink: (course: Course) => `/course/mentor/expel?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, isMentor),
    newTab: false,
  },
  {
    name: `🎟 Course Events`,
    getLink: (course: Course) => `/course/admin/events?course=${course.alias}`,
    access: isAdminRole,
    newTab: false,
  },
  {
    name: `🗂 Course Tasks`,
    getLink: (course: Course) => `/course/admin/tasks?course=${course.alias}`,
    access: isAdminRole,
    newTab: false,
  },
  {
    name: `👩‍🎓 Course Students`,
    getLink: (course: Course) => `/course/admin/students?course=${course.alias}`,
    access: combineOr(isAdminRole, isCourseManager),
    newTab: false,
  },
  {
    name: `👩‍🏫 Course Mentors`,
    getLink: (course: Course) => `/course/admin/mentors?course=${course.alias}`,
    access: combineOr(isAdminRole, isCourseManager),
    newTab: false,
  },

  // {
  //   name: `➡️ Assign Tasks`,
  //   getLink: (course: Course) => `/course/admin/task-assign?course=${course.alias}`,
  //   access: combine(isCourseNotCompleted, isAdmin),
  //   newTab: false,
  // },
];

class IndexPage extends React.PureComponent<Props, State> {
  state: State = {
    dropdownOpen: false,
    activeCourseId: null,
    hasRegistryBanner: false,
    collapsed: false,
  };

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  private hasAccessToCourse = (session: Session, course: Course) => {
    const { isAdmin, isHirer, isActivist } = session;
    const role = session.roles[course.id];
    return !!role || isAdmin || isHirer || isActivist;
  };

  private getLinks = (course: Course) => {
    if (!this.props.session) {
      return [];
    }

    if (!this.hasAccessToCourse(this.props.session, course)) {
      return [];
    }

    const role = this.props.session.roles[course.id];
    return routes
      .filter(route => route.access(course, role, this.props.session))
      .map(route => ({
        name: route.name,
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
    return courses
      .filter(course => session.roles[course.id] || isAdmin)
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

  componentDidMount() {
    const wasMentor = Object.values(this.props.session.roles).some(v => v === 'mentor');

    const plannedCourses = (this.props.courses || []).filter(course => course.planned);
    const hasRegistryBanner =
      wasMentor &&
      plannedCourses.length > 0 &&
      plannedCourses.every(course => this.props.session.roles[course.id] == null);
    this.setState({ hasRegistryBanner });
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

  private handleChange = (courseId: number) => {
    localStorage.setItem('activeCourseId', courseId as any);
    this.setState({ activeCourseId: courseId });
  };

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
            <Content>
              {/* <ActivityBanner /> */}
              <div className="m-3">
                {!activeCourse && this.renderNoCourse()}
                {this.state.hasRegistryBanner && activeCourse && (
                  <div className="mb-3">
                    <RegistryBanner />
                  </div>
                )}
                {activeCourse && (
                  <Select
                    style={{ width: 250 }}
                    className="mb-2"
                    defaultValue={activeCourse.id}
                    onChange={this.handleChange}
                  >
                    {courses.map(course => (
                      <Select.Option key={course.id} value={course.id}>
                        {course.name} ({this.getStatus(course)})
                      </Select.Option>
                    ))}
                  </Select>
                )}
                {activeCourse && (
                  <List
                    bordered
                    dataSource={this.getLinks(activeCourse)}
                    renderItem={(linkInfo: LinkInfo) => (
                      <List.Item key={linkInfo.link}>
                        <a target={linkInfo.newTab ? '_blank' : '_self'} href={linkInfo.link}>
                          {linkInfo.name}
                        </a>
                      </List.Item>
                    )}
                  />
                )}
                <Row gutter={16}>
                  <Col>
                    <Feedback />
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col>
                    <Help />
                  </Col>
                </Row>
              </div>
            </Content>
          </Layout>
        </Layout>
      </div>
    );
  }
}

type LinkInfo = { name: string; link: string; newTab: boolean };

export default withCourses(withSession(IndexPage));
