import Link from 'next/link';
import { useRouter } from 'next/router';
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
        <>
          {id === arr.length - 1 ? <Menu.Divider /> : null}
          <Menu.Item key={id} style={currentRoute === link ? menuActiveItemStyle : undefined}>
            <Button type="link" href={link} style={{ textAlign: 'left', width: '100%' }}>
              {icon} {title}
            </Button>
          </Menu.Item>
        </>
      ))}
    </Menu>
  );

  return (
    <>
      <nav
        className="no-print"
        style={{
          background: '#fff',
          padding: '8px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          boxShadow: '0px 2px 8px #F0F1F2',
        }}
      >
        <Space size={24}>
          <Link href="/">
            <a>
              <img
                style={{ height: 30 }}
                className="header-logo"
                src="/static/images/logo-rsschool3.png"
                alt="Rolling Scopes School Logo"
              />
            </a>
          </Link>
          <SolidarityUkraine />
        </Space>
        <div className="title">
          <b>{title}</b> {courseName}
        </div>
        <div className="profile">
          <a target="_blank" href="https://docs.app.rs.school">
            <Tooltip title="RS School App docs">
              <Button type="primary" ghost size="large" icon={<QuestionCircleFilled />} style={{ marginRight: 16 }}>
                Help
              </Button>
            </Tooltip>
          </a>
          <Dropdown overlay={menu} trigger={['click']}>
            <Button type="dashed" size="large">
              <GithubAvatar githubId={username} size={24} />
              <span style={{ marginLeft: '12px' }}>My Profile</span>
            </Button>
          </Dropdown>
        </div>
        <style jsx>{`
          .title {
            font-size: 120%;
            align-self: center;
          }
          @media all and (max-width: 540px) {
            .title {
              width: 100%;
              order: 3;
              margin-top: 16px;
            }
          }
        `}</style>
      </nav>
    </>
  );
}
