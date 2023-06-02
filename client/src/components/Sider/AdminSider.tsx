import { CrownOutlined, MenuFoldOutlined, MenuUnfoldOutlined, ShareAltOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import { Session } from 'components/withSession';
import { useActiveCourse } from 'modules/Home/hooks/useActiveCourse';
import Router from 'next/router';
import { useMemo } from 'react';
import { useLocalStorage } from 'react-use';
import { Course } from 'services/models';
import { getAdminMenuItems, getCourseManagementMenuItems } from './data/menuItems';
const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

type Props = { session: Session; courses: Course[]; activeCourse?: Course | null };

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
  return { key, label, icon, children, onClick } as MenuItem;
}

export function AdminSider(props: Props) {
  const [isSiderCollapsed = true, setIsSiderCollapsed] = useLocalStorage<boolean>(LocalStorage.IsSiderCollapsed);
  const [openedSidebarItems = [], setOpenedSidebarItems] = useLocalStorage<string[]>(LocalStorage.OpenedSidebarItems);
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
