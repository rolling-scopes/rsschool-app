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
import { isAdmin, isAnyCoursePowerUser, isHirer } from 'domain/user';

export interface MenuItemsData {
  name: string;
  key: string;
  icon?: JSX.Element;
  href: string;
  access: (session: Session) => boolean;
}

const adminMenuItems: MenuItemsData[] = [
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
    name: 'Employer Page',
    key: 'employerPage',
    icon: <ProfileFilled />,
    href: '/employer',
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

export function getAdminMenuItems(session: Session): MenuItemsData[] {
  return adminMenuItems.filter(item => item.access(session));
}
