import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useMemo } from 'react';
import { Button, Dropdown, Flex, Menu, MenuProps, Space, theme } from 'antd';
import {
  EyeOutlined,
  LogoutOutlined,
  NotificationOutlined,
  QuestionCircleFilled,
  SolutionOutlined,
} from '@ant-design/icons';
import { GithubAvatar } from 'components/GithubAvatar';
import { SolidarityUkraine } from './SolidarityUkraine';
import { HeaderMiniBannerCarousel, HeaderMiniBannerCarouselItem } from './HeaderMiniBannerCarousel';
import { SessionContext } from 'modules/Course/contexts';
import { getNavigationItems } from 'modules/Home/data/links';
import { useActiveCourseContext } from 'modules/Course/contexts/ActiveCourseContext';
import styles from './Header.module.css';
import ThemeSwitch from '@client/components/ThemeSwitch';

type Props = {
  showCourseName?: boolean;
  showCarousel?: boolean;
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
    link: 'https://rs.school/docs/en',
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

const CAROUSEL_ITEMS: ReadonlyArray<HeaderMiniBannerCarouselItem> = [];
const CAROUSEL_INTERVAL_MS = 5000;

export function Header({ title, showCourseName, showCarousel = true }: Props) {
  const { asPath: currentRoute } = useRouter();

  const session = useContext(SessionContext);
  const { course } = useActiveCourseContext();
  const courseNotEmpty = course.id ? course : null;
  const courseLinks = useMemo(() => getNavigationItems(session, courseNotEmpty ?? null), [session, course.id]);

  const menuItems = useMemo((): MenuProps['items'] => {
    const items = MENU_ITEMS.map(({ title, link, target, icon }) => {
      const isActive = currentRoute === link;

      return {
        key: title,
        label: (
          <Button type="link" target={target} href={link} className={isActive ? styles.menuItemActive : undefined}>
            {icon} {title}
          </Button>
        ),
      };
    });

    const lastItem = items.pop() as MenuItem;

    return [...items, { type: 'divider' }, lastItem];
  }, [currentRoute]);

  const { token } = theme.useToken();

  return (
    <Space
      direction="vertical"
      size={0}
      style={{
        width: '100%',
        boxShadow: token.boxShadow,
      }}
    >
      <nav
        className={`${styles.nav} no-print page-header`}
        style={{
          background: token.colorBgContainer,
          color: token.colorTextBase,
        }}
      >
        <Space className={styles.icons}>
          <Link href="/">
            <img
              className={styles.headerLogo}
              src="/static/images/logo-rsschool3.png"
              alt="Rolling Scopes School Logo"
            />
          </Link>
          <SolidarityUkraine />
          {showCarousel && (
            <HeaderMiniBannerCarousel
              className={styles.carousel}
              items={CAROUSEL_ITEMS}
              intervalMs={CAROUSEL_INTERVAL_MS}
            />
          )}
        </Space>
        <div className={styles.center}>
          <div className={styles.title}>
            {title} {showCourseName ? course?.name : null}
          </div>
        </div>
        <Flex align="center">
          <ThemeSwitch />
          {session.githubId && (
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
              <Button type="link" style={{ display: 'flex', alignItems: 'center' }}>
                <GithubAvatar githubId={session?.githubId} size={32} />
              </Button>
            </Dropdown>
          )}
        </Flex>
      </nav>
      <Menu selectedKeys={[currentRoute]} mode="horizontal" items={courseLinks} />
    </Space>
  );
}
