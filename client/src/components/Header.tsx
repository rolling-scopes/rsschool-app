import Link from 'next/link';
import { useRouter } from 'next/router';
import { Fragment, useContext, useMemo } from 'react';
import { Button, Dropdown, Menu, Space } from 'antd';
import {
  EyeOutlined,
  LogoutOutlined,
  QuestionCircleFilled,
  SolutionOutlined,
  NotificationOutlined,
} from '@ant-design/icons';
import { Course } from 'services/models';
import { GithubAvatar } from 'components/GithubAvatar';
import { SolidarityUkraine } from './SolidarityUkraine';
import { SessionContext } from 'modules/Course/contexts';
import { getNavigationItems } from 'modules/Home/data/links';
import { useActiveCourseContext } from 'modules/Course/contexts/ActiveCourseContext';

type Props = {
  showCourseName?: boolean;
  title?: string;
  course?: Course;
};

const MENU_ITEMS = [
  {
    link: '/profile',
    icon: <EyeOutlined />,
    title: 'View',
  },
  {
    link: '/profile/notifications',
    icon: <NotificationOutlined />,
    title: 'Notifications',
  },
  {
    link: '/cv/edit',
    icon: <SolutionOutlined />,
    title: 'My CV',
  },
  {
    link: 'https://docs.app.rs.school',
    icon: <QuestionCircleFilled />,
    title: 'Help',
    target: '_blank',
  },
  {
    link: '/api/v2/auth/github/logout',
    icon: <LogoutOutlined />,
    title: 'Logout',
  },
];

export function Header({ title, showCourseName, course }: Props) {
  const { asPath: currentRoute } = useRouter();
  const menuActiveItemStyle = { backgroundColor: '#e0f2ff' };

  const session = useContext(SessionContext);
  const activeCourse = useActiveCourseContext().course ?? course;
  const courseLinks = useMemo(() => getNavigationItems(session, activeCourse ?? null), [course]);

  const menu = (
    <Menu>
      {MENU_ITEMS.map(({ link, icon, title, target }, id, arr) => (
        <Fragment key={id}>
          {id === arr.length - 1 ? <Menu.Divider /> : null}
          <Menu.Item key={id} style={currentRoute === link ? menuActiveItemStyle : undefined}>
            <Button type="link" target={target} href={link} style={{ textAlign: 'left', width: '100%' }}>
              {icon} {title}
            </Button>
          </Menu.Item>
        </Fragment>
      ))}
    </Menu>
  );

  return (
    <Space
      direction="vertical"
      size={0}
      style={{ boxShadow: '0px 2px 8px #F0F1F2', backgroundColor: '#ffffff', width: '100%' }}
    >
      <nav
        className="nav no-print"
        style={{
          background: '#fff',
          padding: '8px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        <Space className="icons">
          <Link href="/">
            <img
              style={{ height: 30 }}
              className="header-logo"
              src="/static/images/logo-rsschool3.png"
              alt="Rolling Scopes School Logo"
            />
          </Link>
          <SolidarityUkraine />
        </Space>
        <div className="title">
          <b>{title}</b> {showCourseName ? activeCourse?.name : null}
        </div>
        <div className="profile">
          {session.githubId && (
            <Dropdown overlay={menu} trigger={['click']}>
              <Button type="link">
                <GithubAvatar githubId={session?.githubId} size={32} />
              </Button>
            </Dropdown>
          )}
        </div>
        <style jsx>{`
          @media all and (max-width: 768px) {
            .title {
              width: 100%;
              order: 3;
              text-align: center;
              margin-top: 16px;
            }
          }
        `}</style>
      </nav>
      <Menu selectedKeys={[currentRoute]} mode="horizontal" items={courseLinks} />
    </Space>
  );
}
