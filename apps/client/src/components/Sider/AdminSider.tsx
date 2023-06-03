import MenuFoldOutlined from '@ant-design/icons/MenuFoldOutlined';
import MenuUnfoldOutlined from '@ant-design/icons/MenuUnfoldOutlined';
import { Layout, Menu, MenuProps } from 'antd';
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
      menuItems.push({
        key: 'adminArea',
        label: 'Admin area',
        type: 'group',
        children: adminMenuItems.map(item => ({
          key: item.key,
          label: item.name,
          icon: item.icon,
          onClick: () => Router.push(item.href),
        })),
      });
    }
    if (courseManagementMenuItems.length) {
      menuItems.push({
        key: 'courseManagement',
        label: 'Course Management',
        type: 'group',
        children: courseManagementMenuItems.map(item => ({
          key: item.key,
          label: item.name,
          icon: item.icon,
          onClick: () => Router.push(item.href),
        })),
      });
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
