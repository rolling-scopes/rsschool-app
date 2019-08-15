import { ActivityBanner, Header } from 'components';
import { Dropdown, DropdownToggle, Alert, Nav, NavItem, ListGroupItem, DropdownMenu, DropdownItem } from 'reactstrap';
import Router from 'next/router';
import * as React from 'react';
import { Course } from 'services/course';
import withCourses from 'components/withCourses';
import withSession, { Session, Role } from 'components/withSession';
import '../index.scss';

type Props = {
  courses?: Course[];
  session: Session;
};

type State = {
  dropdownOpen: boolean;
  activeCourseId: number | null;
};

const githubIssuesUrl = 'https://github.com/rolling-scopes/rsschool-app/issues';

const anyAccess = () => true;
const isMentor = (_: Course, role: Role, session: Session) => role === 'mentor' || session.isAdmin;
const isCourseManager = (_1: Course, role: Role, _2: Session) => role === 'coursemanager';
const isActivist = (_1: Course, _2: Role, session: Session) => session.isActivist;

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
  },
  {
    name: `✅ Check Task`,
    getLink: (course: Course) => `/course/mentor/check-task?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, isMentor),
  },
  {
    name: `👨‍🏫 Rate Task By Jury`,
    getLink: (course: Course) => `/course/rate-task-jury?course=${course.alias}`,
    access: combineAnd(isCourseNotCompleted, combineOr(isAdminRole, isActivist, isCourseManager)),
  },
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
    return courses.filter(course => session.roles[course.id] || isAdmin).sort((a, b) => b.alias.localeCompare(a.alias));
  }

  private getActiveCourse() {
    const courses = this.getCourses();
    if (courses.length === 0) {
      return null;
    }
    if (this.state.activeCourseId == null) {
      return courses[0];
    }
    return courses.find(course => course.id === this.state.activeCourseId);
  }

  private renderLink = (linkInfo: LinkInfo) => {
    return (
      <ListGroupItem key={linkInfo.link}>
        <a
          href={linkInfo.link}
          onClick={evt => {
            evt.preventDefault();
            Router.push(linkInfo.link);
          }}
        >
          {linkInfo.name}
        </a>
      </ListGroupItem>
    );
  };

  private getStatus = (course: Course) => {
    if (course.completed) {
      return 'Completed';
    }
    if (course.planned) {
      return 'Planned';
    }
    return 'Active';
  };

  renderNoCourse() {
    const hasPlanned = (this.props.courses || []).some(course => course.planned && !course.completed);
    return (
      <Alert color="warning" style={{ fontSize: '1rem' }}>
        <div>You are not student or mentor in any active course</div>
        {hasPlanned ? (
          <div>
            You can <a href="/course/registry">register here</a> to the upcoming course
          </div>
        ) : (
          <div>Unfortunately, there are no any planned courses for now.</div>
        )}
      </Alert>
    );
  }

  render() {
    const { isAdmin } = this.props.session;
    const activeCourse = this.getActiveCourse();
    return (
      <div>
        <ActivityBanner />

        <Header username={this.props.session.githubId} />

        <div className="m-3">
          {!activeCourse && this.renderNoCourse()}
          <Nav className="mb-3">
            {isAdmin && (
              <NavItem>
                <a href="/admin/tasks">All Tasks</a>
              </NavItem>
            )}
            {isAdmin && (
              <NavItem>
                <a href="/admin/users">All Users</a>
              </NavItem>
            )}
          </Nav>
          {activeCourse && (
            <Dropdown
              isOpen={this.state.dropdownOpen}
              toggle={() => this.setState({ dropdownOpen: !this.state.dropdownOpen })}
            >
              <DropdownToggle style={{ fontSize: '1rem' }} caret>
                {activeCourse.name} ({this.getStatus(activeCourse)})
              </DropdownToggle>
              <DropdownMenu>
                {this.getCourses().map(course => (
                  <DropdownItem onClick={() => this.setState({ activeCourseId: course.id })} key={course.id}>
                    {course.name} ({this.getStatus(course)})
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          )}
          {activeCourse && this.getLinks(activeCourse).map(this.renderLink)}
        </div>
      </div>
    );
  }
}

type LinkInfo = { name: string; link: string };

export default withCourses(withSession(IndexPage));
