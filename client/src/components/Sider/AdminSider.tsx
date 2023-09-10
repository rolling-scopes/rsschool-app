import { CrownOutlined, MenuFoldOutlined, MenuUnfoldOutlined, ShareAltOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import Router from 'next/router';
import { useMemo, useContext } from 'react';
import { useLocalStorage } from 'react-use';
import { getAdminMenuItems, getCourseManagementMenuItems } from './data/menuItems';
import { SessionContext } from 'modules/Course/contexts';
import { Course } from 'services/models';
import { useActiveCourse } from 'modules/Home/hooks/useActiveCourse';
const { Sider } = Layout;

type Props = { courses: Course[]; activeCourse?: Course | null };

type MenuItem = Required<MenuProps>['items'][number];

enum LocalStorage {
  IsSiderCollapsed = 'isSiderCollapsed',
  OpenedSidebarItems = 'openedSidebarItems',
}

function getItem(
  key: React.Key,
  label: React.ReactNode,
  icon?: React.ReactNode,
  children?: MenuItem[],
  onClick?: () => void,
): MenuItem {
  return { key, label, icon, children, onClick };
}

export function AdminSider(props: Props) {
  const [isSiderCollapsed = true, setIsSiderCollapsed] = useLocalStorage<boolean>(LocalStorage.IsSiderCollapsed);
  const [openedSidebarItems = [], setOpenedSidebarItems] = useLocalStorage<string[]>(LocalStorage.OpenedSidebarItems);
  const [activeCourse] = useActiveCourse(props.courses);

  const session = useContext(SessionContext);

  const adminMenuItems = getAdminMenuItems(session);
  const courseManagementMenuItems = useMemo(
    () => getCourseManagementMenuItems(session, props.activeCourse ?? activeCourse),
    [activeCourse],
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
          'adminArea',
          'Admin Area',
          <CrownOutlined />,
          adminMenuItems.map(item => getItem(item.key, item.name, item.icon, undefined, () => Router.push(item.href))),
        ),
      );
    }
    if (courseManagementMenuItems.length) {
      menuItems.push(
        getItem(
          'courseManagement',
          'Course Management',
          <ShareAltOutlined />,
          courseManagementMenuItems.map(item =>
            getItem(item.key, item.name, item.icon, undefined, () => Router.push(item.href)),
          ),
        ),
      );
    }
    return menuItems;
  };

  const onSidebarItemChanged: MenuProps['onOpenChange'] = (sidebarItemsKeys: string[]) => {
    setOpenedSidebarItems(sidebarItemsKeys);
  };

  return (
    <Sider trigger={null} collapsible collapsed={isSiderCollapsed} theme="light" width={220}>
      {isSiderCollapsed ? <MenuUnfoldOutlined {...menuIconProps} /> : <MenuFoldOutlined {...menuIconProps} />}
      <Menu
        mode="inline"
        items={getMenuItems()}
        defaultOpenKeys={openedSidebarItems}
        onOpenChange={onSidebarItemChanged}
      />
    </Sider>
  );
}
