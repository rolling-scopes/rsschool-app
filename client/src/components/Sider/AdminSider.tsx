import { MenuFoldOutlined, MenuUnfoldOutlined, SearchOutlined, ToolOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import SubMenu from 'antd/lib/menu/SubMenu';
import { Session } from 'components/withSession';
import { useActiveCourse } from 'modules/Home/hooks/useActiveCourse';
import Link from 'next/link';
import { useMemo } from 'react';
import { useLocalStorage } from 'react-use';
import { Course } from 'services/models';
import { getAdminMenuItems, getCourseManagementMenuItems } from './data/menuItems';
const { Sider } = Layout;

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

  return (
    <Sider trigger={null} collapsible collapsed={isSiderCollapsed} theme="light" width={220}>
      {isSiderCollapsed ? <MenuUnfoldOutlined {...menuIconProps} /> : <MenuFoldOutlined {...menuIconProps} />}
      <Menu mode="inline">
        {adminMenuItems.length ? (
          <SubMenu key="adminArea" icon={<SearchOutlined />} title="Admin area">
            {adminMenuItems.map(item => (
              <Menu.Item key={item.key}>
                <Link prefetch={false} href={item.href}>
                  <a>
                    {item.icon}
                    <span>{item.name}</span>
                  </a>
                </Link>
              </Menu.Item>
            ))}
          </SubMenu>
        ) : null}
        {courseManagementMenuItems.length ? (
          <SubMenu key="courseManagement" icon={<ToolOutlined />} title="Course management">
            {courseManagementMenuItems.map(item => (
              <Menu.Item key={item.key}>
                <Link prefetch={false} href={item.href}>
                  <a>
                    {item.icon}
                    <span>{item.name}</span>
                  </a>
                </Link>
              </Menu.Item>
            ))}
          </SubMenu>
        ) : null}
      </Menu>
    </Sider>
  );
}
