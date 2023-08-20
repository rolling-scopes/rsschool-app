import Link from 'next/link';
import { useRouter } from 'next/router';
import { Fragment, useContext, useMemo } from 'react';
import { Button, Dropdown, Menu, Space, Tooltip } from 'antd';
import {
  EyeOutlined,
  LogoutOutlined,
  QuestionCircleFilled,
  SolutionOutlined,
  NotificationOutlined,
} from '@ant-design/icons';
import { GithubAvatar } from 'components/GithubAvatar';
import { SolidarityUkraine } from './SolidarityUkraine';
import { SessionAndCourseContext } from 'modules/Course/contexts';
import { getNavigationItems } from 'modules/Home/data/links';

type Props = {
  showCourseName?: boolean;
  title?: string;
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
    link: '/api/v2/auth/github/logout',
    icon: <LogoutOutlined />,
    title: 'Logout',
  },
];

export function Header({ title, showCourseName }: Props) {
  const { asPath: currentRoute } = useRouter();
  const menuActiveItemStyle = { backgroundColor: '#e0f2ff' };

  const { session, activeCourse } = useContext(SessionAndCourseContext);
  const courseLinks = useMemo(() => getNavigationItems(session, activeCourse ?? null), [activeCourse]);

  const menu = (
    <Menu>
      {MENU_ITEMS.map(({ link, icon, title }, id, arr) => (
        <Fragment key={id}>
          {id === arr.length - 1 ? <Menu.Divider /> : null}
          <Menu.Item key={id} style={currentRoute === link ? menuActiveItemStyle : undefined}>
            <Button type="link" href={link} style={{ textAlign: 'left', width: '100%' }}>
              {icon} {title}
            </Button>
          </Menu.Item>
        </Fragment>
      ))}
    </Menu>
  );

  return (
    <Space direction="vertical" style={{ boxShadow: '0px 2px 8px #F0F1F2', backgroundColor: '#ffffff', width: '100%' }}>
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
          <a target="_blank" href="https://docs.app.rs.school">
            <Tooltip title="RS School App docs">
              <Button type="primary" ghost size="large" style={{ marginRight: 8 }}>
                <QuestionCircleFilled />
                <span className="button-text">Help</span>
              </Button>
            </Tooltip>
          </a>
          <Dropdown overlay={menu} trigger={['click']}>
            <Button type="dashed" size="large">
              <GithubAvatar githubId={session?.githubId} size={24} />
              <span style={{ marginLeft: '12px' }} className="button-text">
                My Profile
              </span>
            </Button>
          </Dropdown>
        </div>
        <style jsx>{`
          .title {
            font-size: 120%;
            align-self: center;
          }
          @media all and (max-width: 768px) {

            .title {
              width: 100%;
              order: 3;
              text-align: center;
              margin-top: 16px;
            }

            .button-text {
              display: none;
            }
          }
        `}</style>
      </nav>
      <Menu selectedKeys={[currentRoute]} mode="horizontal" items={courseLinks} />
    </Space>
  );
}
