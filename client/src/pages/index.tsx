import { Button, List, Select, Result } from 'antd';

import { ActivityBanner, Header, RegistryBanner } from 'components';
import withCourses from 'components/withCourses';
import withSession, { Role, Session } from 'components/withSession';
import * as React from 'react';
import { Course } from 'services/course';
import '../styles/main.scss';

type Props = {
  courses?: Course[];
  session: Session;
};

type State = {
  dropdownOpen: boolean;
  activeCourseId: number | null;
  hasRegistryBanner: boolean;
};

const githubIssuesUrl = 'https://github.com/rolling-scopes/rsschool-app/issues';

const anyAccess = () => true;
const isMentor = (_: Course, role: Role, session: Session) => role === 'mentor' || session.isAdmin;
// const isCourseManager = (_1: Course, role: Role, _2: Session) => role === 'coursemanager';
// const isActivist = (_1: Course, _2: Role, session: Session) => session.isActivist;

const isAdminRole = (_1: Course, _2: Role, session: Session) => session.isAdmin;
const isCourseNotCompleted = (course: Course) => !course.completed;

const combineAnd = (...checks: any[]) => (course: Course, role: Role, session: Session) =>
  checks.every(check => check(course, role, session));

// const combineOr = (...checks: any[]) => (course: Course, role: Role, session: Session) =>
//   checks.some(check => check(course, role, session));

const routes = [
  {
    name: `📜 Registrations`,
    getLink: (_: Course) => `/admin/registrations`,
    access: isAdminRole,
  },
  {
    name: `🔥 Score`,
    getLink: (course: Course) => `/course/score?course=${course.alias}`,
    access: anyAccess,
  },
  {
    name: `✅ Check Task`,
    getLink: (course: Course) => `/course/mentor/check-task?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, isMentor),
  },
  // {
  //   name: `👨‍🏫 Rate Task By Jury`,
  //   getLink: (course: Course) => `/course/rate-task-jury?course=${course.alias}`,
  //   access: combineAnd(isCourseNotCompleted, combineOr(isAdminRole, isActivist, isCourseManager)),
  // },
  {
    name: `👏 Public Feedback (#gratitude)`,
    getLink: (course: Course) => `/course/gratitude?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, anyAccess),
  },
  {
    name: `💌 Private Feedback`,
    getLink: (_: Course) => `/private-feedback`,
    access: combineAnd(isCourseNotCompleted, anyAccess),
  },
  // {
  //   name: `🎤 Interview Feedback`,
  //   getLink: (course: Course) => `/course/mentor/interview-feedback?course=${course.alias}`,
  //   access: combine(isCourseNotCompleted, isMentor),
  // },
  {
    name: `😞 Expel Student`,
    getLink: (course: Course) => `/course/mentor/expel?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, isMentor),
  },
  {
    name: `🗂 Course Tasks`,
    getLink: (course: Course) => `/course/admin/tasks?course=${course.alias}`,
    access: isAdminRole,
  },
  {
    name: `🐞 Submit "Bug"`,
    getLink: (_: Course) => `${githubIssuesUrl}/new?assignees=apalchys&labels=&template=bug_report.md`,
    access: combineAnd(isCourseNotCompleted, anyAccess),
  },
  {
    name: `🔢 Submit "Data Issue"`,
    getLink: (_: Course) => `${githubIssuesUrl}/new?assignees=apalchys&labels=&template=data-issue-report.md&title=`,
    access: anyAccess,
  },
  // {
  //   name: `➡️ Assign Tasks`,
  //   getLink: (course: Course) => `/course/admin/task-assign?course=${course.alias}`,
  //   access: combine(isCourseNotCompleted, isAdmin),
  // },
];

class IndexPage extends React.PureComponent<Props, State> {
  state: State = {
    dropdownOpen: false,
    activeCourseId: null,
    hasRegistryBanner: false,
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
    const plannedCourses = (this.props.courses || []).filter(course => course.planned && !course.completed);
    const hasRegistryBanner = wasMentor && plannedCourses.every(course => this.props.session.roles[course.id] == null);
    this.setState({ hasRegistryBanner });
  }

  renderNoCourse() {
    const hasPlanned = (this.props.courses || []).some(course => course.planned && !course.completed);
    return (
      <Result
        status="404"
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
        <ActivityBanner />

        <Header username={this.props.session.githubId} />

        <div className="m-3">
          {!activeCourse && this.renderNoCourse()}
          {isAdmin && (
            <div className="mb-3">
              <Button type="link">
                <a href="/admin/courses">Courses</a>
              </Button>
              <Button type="link">
                <a href="/admin/stages">Stages</a>
              </Button>
              <Button type="link">
                <a href="/admin/tasks">Tasks</a>
              </Button>
              <Button type="link">
                <a href="/admin/events">Events</a>
              </Button>
              <Button type="link">
                <a href="/admin/users">Users</a>
              </Button>
            </div>
          )}
          {this.state.hasRegistryBanner && activeCourse && (
            <div className="mb-3">
              <RegistryBanner />
            </div>
          )}
          {activeCourse && (
            <Select style={{ width: 250 }} className="mb-2" defaultValue={activeCourse.id} onChange={this.handleChange}>
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
                  <a href={linkInfo.link}>{linkInfo.name}</a>
                </List.Item>
              )}
            />
          )}
        </div>
      </div>
    );
  }
}

type LinkInfo = { name: string; link: string };

export default withCourses(withSession(IndexPage));
