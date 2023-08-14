import Link from 'next/link';
import { useRouter } from 'next/router';
import { Fragment } from 'react';
import { Button, Dropdown, Menu, Space, Tooltip } from 'antd';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import QuestionCircleFilled from '@ant-design/icons/QuestionCircleFilled';
import SolutionOutlined from '@ant-design/icons/SolutionOutlined';
import NotificationOutlined from '@ant-design/icons/NotificationOutlined';
import { GithubAvatar } from 'components/GithubAvatar';
import { SolidarityUkraine } from './SolidarityUkraine';

type Props = {
  username: string;
  courseName?: string;
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

export function Header({ title, courseName, username }: Props) {
  const { asPath: currentRoute } = useRouter();
  const menuActiveItemStyle = { backgroundColor: '#e0f2ff' };

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
    <>
      <nav
        className="nav no-print"
        style={{
          background: '#fff',
          padding: '8px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          boxShadow: '0px 2px 8px #F0F1F2',
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
          <b>{title}</b> {courseName}
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
              <GithubAvatar githubId={username} size={24} />
              <span className="button-text" style={{ marginLeft: '12px' }}>
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
          @media all and (max-width: 540px) {
            .header-logo {
              position: relative;
              z-index: 1;
            }

            .nav > :global(.icons > div:last-child) {
              margin-left: -48px;
            }

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
    </>
  );
}
