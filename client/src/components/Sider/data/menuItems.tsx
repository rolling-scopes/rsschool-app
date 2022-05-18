import {
  HomeOutlined,
  GlobalOutlined,
  QuestionOutlined,
  AlertOutlined,
  BellOutlined,
  UserOutlined,
  IdcardFilled,
  RobotFilled,
  TeamOutlined,
  ProfileFilled,
  NotificationFilled,
} from '@ant-design/icons';
import { Session } from 'components/withSession';
import { isAdmin, isAnyCoursePowerUser, isCourseManager, isCourseSupervisor, isHirer } from 'domain/user';
import { Course } from 'services/models';

export interface MenuItemsData {
  name: string;
  key: string;
  icon?: JSX.Element;
}

interface AdminMenuItemsData extends MenuItemsData {
  access: (session: Session) => boolean;
  href: string;
}

interface CourseManagementMenuItemsData extends MenuItemsData {
  getUrl: (course: Course) => string;
  courseAccess: (session: Session, courseId: number) => boolean;
}

export interface MenuItemsRenderData {
  name: string;
  key: string;
  icon?: JSX.Element;
  href: string;
}

const some =
  (...checks: ((session: Session, courseId: number) => boolean)[]) =>
  (session: Session, courseId: number) =>
    checks.some(check => check(session, courseId));

const adminMenuItems: AdminMenuItemsData[] = [
  {
    name: 'Main',
    key: 'main',
    icon: <HomeOutlined />,
    href: '/',
    access: session => isAdmin(session) || isAnyCoursePowerUser(session),
  },
  {
    name: 'Courses',
    key: 'courses',
    icon: <GlobalOutlined />,
    href: '/admin/courses',
    access: session => isAdmin(session),
  },
  {
    name: 'Interview questions',
    key: 'interviewQuestions',
    icon: <QuestionOutlined />,
    href: '/admin/interview-questions',
    access: session => isAdmin(session) || isAnyCoursePowerUser(session),
  },
  {
    name: 'Tasks',
    key: 'tasks',
    icon: <AlertOutlined />,
    href: '/admin/tasks',
    access: session => isAdmin(session) || isAnyCoursePowerUser(session),
  },
  {
    name: 'Events',
    key: 'events',
    icon: <BellOutlined />,
    href: '/admin/events',
    access: session => isAdmin(session) || isAnyCoursePowerUser(session),
  },
  {
    name: 'Users',
    key: 'users',
    icon: <UserOutlined />,
    href: '/admin/users',
    access: session => isAdmin(session),
  },
  {
    name: 'Mentor Registry',
    key: 'mentorRegistry',
    icon: <IdcardFilled />,
    href: '/admin/mentor-registry',
    access: session => isAdmin(session) || isAnyCoursePowerUser(session),
  },
  {
    name: 'Discord Servers',
    key: 'discordServers',
    icon: <RobotFilled />,
    href: '/admin/discord-server',
    access: session => isAdmin(session),
  },
  {
    name: 'User Groups',
    key: 'userGroups',
    icon: <TeamOutlined />,
    href: '/admin/user-group',
    access: session => isAdmin(session),
  },
  {
    name: 'Applicants',
    key: 'applicants',
    icon: <ProfileFilled />,
    href: '/applicants',
    access: session => isAdmin(session) || isHirer(session),
  },
  {
    name: 'Notifications',
    key: 'notifications',
    icon: <NotificationFilled />,
    href: '/admin/notifications',
    access: session => isAdmin(session) || isAnyCoursePowerUser(session),
  },
];

export function getAdminMenuItems(session: Session): MenuItemsRenderData[] {
  return adminMenuItems.filter(item => item.access(session));
}

const courseManagementMenuItems: CourseManagementMenuItemsData[] = [
  {
    name: 'Course Events',
    key: 'courseEvents',
    getUrl: (course: Course) => `/course/admin/events?course=${course.alias}`,
    courseAccess: isCourseManager,
  },
  {
    name: 'Course Tasks',
    key: 'courseTasks',
    getUrl: (course: Course) => `/course/admin/tasks?course=${course.alias}`,
    courseAccess: isCourseManager,
  },
  {
    name: 'Course Students',
    key: 'courseStudents',
    getUrl: (course: Course) => `/course/admin/students?course=${course.alias}`,
    courseAccess: some(isCourseManager, isCourseSupervisor),
  },
  {
    name: 'Course Mentors',
    key: 'courseMentors',
    getUrl: (course: Course) => `/course/admin/mentors?course=${course.alias}`,
    courseAccess: some(isCourseManager, isCourseSupervisor),
  },
  {
    name: 'Course Users',
    key: 'courseUsers',
    getUrl: (course: Course) => `/course/admin/users?course=${course.alias}`,
    courseAccess: isAdmin,
  },
  {
    name: 'Cross-Сheck Table',
    key: 'Cross-Сheck Table',
    getUrl: (course: Course) => `/course/admin/cross-check-table?course=${course.alias}`,
    courseAccess: isCourseManager,
  },
  {
    name: 'Technical Screening',
    key: 'technicalScreening',
    getUrl: (course: Course) => `/course/admin/stage-interviews?course=${course.alias}`,
    courseAccess: some(isCourseManager, isCourseSupervisor),
  },
  {
    name: 'CoreJs Interviews',
    key: 'coreJsInterviews',
    getUrl: (course: Course) => `/course/admin/interviews?course=${course.alias}`,
    courseAccess: isCourseManager,
  },
];

export function getCourseManagementMenuItems(session: Session, activeCourse: Course | null): MenuItemsRenderData[] {
  return activeCourse
    ? courseManagementMenuItems
        .filter(route => isAdmin(session) || (route.courseAccess(session, activeCourse.id) ?? true))
        .map(({ name, key, icon, getUrl }) => ({ name, icon, key, href: getUrl(activeCourse) }))
    : [];
}
