import AlertOutlined from '@ant-design/icons/AlertOutlined';
import AppstoreAddOutlined from '@ant-design/icons/AppstoreAddOutlined';
import BellOutlined from '@ant-design/icons/BellOutlined';
import GlobalOutlined from '@ant-design/icons/GlobalOutlined';
import HomeOutlined from '@ant-design/icons/HomeOutlined';
import IdcardFilled from '@ant-design/icons/IdcardFilled';
import NotificationFilled from '@ant-design/icons/NotificationFilled';
import ProfileFilled from '@ant-design/icons/ProfileFilled';
import TeamOutlined from '@ant-design/icons/TeamOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';
import { DiscordOutlined } from 'components/Icons/DiscordOutlined';
import { Session } from 'components/withSession';
import {
  isAdmin,
  isAnyCourseManager,
  isAnyCoursePowerUser,
  isCourseManager,
  isDementor,
  isCourseSupervisor,
  isHirer,
  isAnyCourseDementor,
} from 'domain/user';
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
    access: session => isAdmin(session) || isAnyCoursePowerUser(session) || isAnyCourseDementor(session),
  },
  {
    name: 'Disciplines',
    key: 'disciplines',
    icon: <AppstoreAddOutlined />,
    href: '/admin/disciplines',
    access: session => isAdmin(session),
  },
  {
    name: 'Courses',
    key: 'courses',
    icon: <GlobalOutlined />,
    href: '/admin/courses',
    access: session => isAdmin(session) || isAnyCourseManager(session),
  },
  {
    name: 'Tasks',
    key: 'tasks',
    icon: <AlertOutlined />,
    href: '/admin/tasks',
    access: session => isAdmin(session) || isAnyCourseManager(session),
  },
  {
    name: 'Events',
    key: 'events',
    icon: <BellOutlined />,
    href: '/admin/events',
    access: session => isAdmin(session) || isAnyCourseManager(session),
  },
  {
    name: 'Users',
    key: 'users',
    icon: <UserOutlined />,
    href: '/admin/users',
    access: session => isAdmin(session) || isAnyCourseManager(session),
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
    icon: <DiscordOutlined />,
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
    access: session => isAdmin(session),
  },
  {
    name: 'Prompts',
    key: 'prompts',
    icon: <FileTextOutlined />,
    href: '/admin/prompts',
    access: session => isAdmin(session),
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
    courseAccess: some(isCourseManager, isCourseSupervisor, isDementor),
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
    courseAccess: isCourseManager,
  },
  {
    name: 'Cross-Сheck Table',
    key: 'Cross-Сheck Table',
    getUrl: (course: Course) => `/course/admin/cross-check-table?course=${course.alias}`,
    courseAccess: some(isCourseManager, isDementor),
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
  {
    name: 'Mentor Tasks Review',
    key: 'mentorTasksReview',
    getUrl: (course: Course) => `/course/admin/mentor-tasks-review?course=${course.alias}`,
    courseAccess: some(isCourseManager, isDementor),
  },
];

export function getCourseManagementMenuItems(session: Session, activeCourse: Course | null): MenuItemsRenderData[] {
  return activeCourse
    ? courseManagementMenuItems
        .filter(route => isAdmin(session) || (route.courseAccess(session, activeCourse.id) ?? true))
        .map(({ name, key, icon, getUrl }) => ({ name, icon, key, href: getUrl(activeCourse) }))
    : [];
}
