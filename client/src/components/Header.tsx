import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button, Dropdown, Menu, Space, Tooltip } from 'antd';
import {
  EyeOutlined,
  LogoutOutlined,
  QuestionCircleFilled,
  SaveTwoTone,
  SolutionOutlined,
  NotificationOutlined,
} from '@ant-design/icons';
import { GithubAvatar } from 'components/GithubAvatar';
import { SolidarityUkraine } from './SolidarityUkraine';

type Props = {
  username: string;
  courseName?: string;
  title?: string;
  isSaveButtonVisible?: boolean;
  onSaveClick?: () => void;
};

const MENU_ITEMS = [
  {
    LINK: '/profile',
    ICON: <EyeOutlined />,
    TITLE: 'View',
  },
  {
    LINK: '/profile/notifications',
    ICON: <NotificationOutlined />,
    TITLE: 'Notifications',
  },

  {
    LINK: '/cv/edit',
    ICON: <SolutionOutlined />,
    TITLE: 'My CV',
  },
  {
    LINK: '/api/v2/auth/github/logout',
    ICON: <LogoutOutlined />,
    TITLE: 'Logout',
  },
];

export function Header({ isSaveButtonVisible, title, courseName, username, onSaveClick }: Props) {
  const { asPath: currentRoute } = useRouter();
  const menuActiveItemStyle = { backgroundColor: '#e0f2ff' };

  const menu = (
    <Menu>
      {MENU_ITEMS.map(({ LINK, ICON, TITLE }, id) => (
        <Menu.Item key={id} style={currentRoute === LINK ? menuActiveItemStyle : undefined}>
          <Button type="link" href={LINK} style={{ textAlign: 'left', width: '100%' }}>
            {ICON} {TITLE}
          </Button>
        </Menu.Item>
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
          {isSaveButtonVisible && (
            <Button danger ghost size="large" style={{ marginRight: 16, height: 38 }} onClick={onSaveClick}>
              <SaveTwoTone twoToneColor={['#f5222d', '#fff1f0']} />
              <span style={{ marginLeft: 7, fontSize: 14, verticalAlign: 'text-top', color: '#f5222d' }}>Save</span>
            </Button>
          )}
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
