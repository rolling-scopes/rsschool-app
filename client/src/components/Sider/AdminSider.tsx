import { MenuFoldOutlined, MenuUnfoldOutlined, SearchOutlined, ToolOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import SubMenu from 'antd/lib/menu/SubMenu';
import { Session } from 'components/withSession';
import { useActiveCourse } from 'modules/Home/hooks/useActiveCourse';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Course } from 'services/models';
import { getAdminMenuItems, getCourseManagementMenuItems } from './data/menuItems';
const { Sider } = Layout;

type Props = { session: Session; courses: Course[]; activeCourse?: Course | null };

export function AdminSider(props: Props) {
  const [collapsed, setCollapsed] = useState(true);
  const [activeCourse] = useActiveCourse(props.courses);
  const adminMenuItems = getAdminMenuItems(props.session);
  const courseManagementMenuItems = useMemo(
    () => getCourseManagementMenuItems(props.session, props.activeCourse ?? activeCourse),
    [props.activeCourse, activeCourse],
  );

  const menuIconProps = {
    onClick: () => {
      setCollapsed(!collapsed);
    },
    style: { fontSize: '20px', display: 'block', lineHeight: '30px', padding: '20px 32px' },
  };

  return (
    <Sider trigger={null} collapsible collapsed={collapsed} theme="light" width={220}>
      {collapsed ? <MenuUnfoldOutlined {...menuIconProps} /> : <MenuFoldOutlined {...menuIconProps} />}
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
