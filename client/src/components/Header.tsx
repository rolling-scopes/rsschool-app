import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useMemo } from 'react';
import { Button, Dropdown, Menu, Space } from 'antd';
import type { MenuProps } from 'antd';
import {
  EyeOutlined,
  LogoutOutlined,
  QuestionCircleFilled,
  SolutionOutlined,
  NotificationOutlined,
} from '@ant-design/icons';
import { GithubAvatar } from 'components/GithubAvatar';
import { SolidarityUkraine } from './SolidarityUkraine';
import { SessionContext } from 'modules/Course/contexts';
import { getNavigationItems } from 'modules/Home/data/links';
import { useActiveCourseContext } from 'modules/Course/contexts/ActiveCourseContext';
import css from 'styled-jsx/css';

type Props = {
  showCourseName?: boolean;
  title?: string;
};

type MenuItem = Required<MenuProps>['items'][number];

const MENU_ITEMS = [
  {
    link: '/profile',
    icon: <EyeOutlined />,
    title: 'Profile',
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

export function Header({ title, showCourseName }: Props) {
  const { asPath: currentRoute } = useRouter();

  const session = useContext(SessionContext);
  const { course } = useActiveCourseContext();
  const courseLinks = useMemo(() => getNavigationItems(session, course ?? null), [course]);

  const menuItems = useMemo((): MenuProps['items'] => {
    const items = MENU_ITEMS.map(({ title, link, target, icon }) => {
      const isActive = currentRoute === link;

      return {
        key: title,
        label: (
          <Button type="link" target={target} href={link} className={isActive ? 'menu-item-active' : undefined}>
            {icon} {title}
          </Button>
        ),
      };
    });

    const lastItem = items.pop() as MenuItem;

    return [...items, { type: 'divider' }, lastItem];
  }, [currentRoute]);

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
          <b>{title}</b> {showCourseName ? course?.name : null}
        </div>
        <div className="profile">
          {session.githubId && (
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
              <Button type="link">
                <GithubAvatar githubId={session?.githubId} size={32} />
              </Button>
            </Dropdown>
          )}
        </div>
        <style jsx>{styles}</style>
      </nav>
      <Menu selectedKeys={[currentRoute]} mode="horizontal" items={courseLinks} />
    </Space>
  );
}

const styles = css`
  :global(li:has(.menu-item-active)) {
    background-color: #e0f2ff;
  }

  @media all and (max-width: 768px) {
    .title {
      width: 100%;
      order: 3;
      text-align: center;
      margin-top: 16px;
    }
  }
`;
