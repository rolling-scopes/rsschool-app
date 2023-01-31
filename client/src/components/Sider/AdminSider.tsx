import { MenuFoldOutlined, MenuUnfoldOutlined, SearchOutlined, ToolOutlined } from '@ant-design/icons';
import { Layout, Menu, MenuProps } from 'antd';
import { Session } from 'components/withSession';
import { useActiveCourse } from 'modules/Home/hooks/useActiveCourse';
import Link from 'next/link';
import { useMemo, ReactNode, Key } from 'react';
import { useLocalStorage } from 'react-use';
import { Course } from 'services/models';
import { getAdminMenuItems, getCourseManagementMenuItems } from './data/menuItems';
const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

type Props = { session: Session; courses: Course[]; activeCourse?: Course | null };

enum LocalStorage {
  IsSiderCollapsed = 'isSiderCollapsed',
}

function getItem(label: ReactNode, key: Key, icon?: ReactNode, children?: MenuItem[], type?: 'group'): MenuItem {
  return { key, icon, children, label, type };
}

export function AdminSider(props: Props) {
  const [isSiderCollapsed = true, setIsSiderCollapsed] = useLocalStorage<boolean>(LocalStorage.IsSiderCollapsed);
  const [activeCourse] = useActiveCourse(props.courses);
  const adminMenuItems = getAdminMenuItems(props.session);
  const courseManagementMenuItems = useMemo(
    () => getCourseManagementMenuItems(props.session, props.activeCourse ?? activeCourse),
    [props.activeCourse, activeCourse],
  );

  const menuIconProps = {
    onClick: () => {
      setIsSiderCollapsed(!isSiderCollapsed);
    },
    style: { fontSize: '20px', display: 'block', lineHeight: '30px', padding: '20px 32px' },
  };

  const getMenuItems = () => {
    const menuItems: MenuItem[] = [];
    if (adminMenuItems.length) {
      menuItems.push(
        getItem(
          'Admin area',
          'adminArea',
          <SearchOutlined />,
          adminMenuItems.map(item =>
            getItem(
              <Menu.Item key={item.key}>
                <Link prefetch={false} href={item.href}>
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </Menu.Item>,
              item.key,
            ),
          ),
        ),
      );
    }
    if (courseManagementMenuItems.length) {
      menuItems.push(
        getItem(
          'Course management',
          'courseManagement',
          <ToolOutlined />,
          courseManagementMenuItems.map(item =>
            getItem(
              <Menu.Item key={item.key}>
                <Link prefetch={false} href={item.href}>
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </Menu.Item>,
              item.key,
            ),
          ),
        ),
      );
    }
    return menuItems;
  };

  return (
    <Sider trigger={null} collapsible collapsed={isSiderCollapsed} theme="light" width={220}>
      {isSiderCollapsed ? <MenuUnfoldOutlined {...menuIconProps} /> : <MenuFoldOutlined {...menuIconProps} />}
      <Menu mode="inline" items={getMenuItems()}></Menu>
    </Sider>
  );
}
