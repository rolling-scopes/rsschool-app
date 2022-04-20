import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import { Session } from 'components/withSession';
import Link from 'next/link';
import { useState } from 'react';
import { getAdminMenuItems } from './data/menuItems';
const { Sider } = Layout;

type Props = { session: Session };

export function AdminSider(props: Props) {
  const [collapsed, setCollapsed] = useState(true);
  const adminMenuItems = getAdminMenuItems(props.session);
  const menuIconProps = {
    onClick: () => {
      setCollapsed(!collapsed);
    },
    style: { fontSize: '20px', display: 'block', lineHeight: '30px', padding: '20px 32px' },
  };

  return (
    <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
      {collapsed ? <MenuUnfoldOutlined {...menuIconProps} /> : <MenuFoldOutlined {...menuIconProps} />}
      <Menu mode="inline">
        {adminMenuItems.length
          ? adminMenuItems.map(item => (
              <Menu.Item key={item.key}>
                <Link prefetch={false} href={item.href}>
                  <a>
                    {item.icon}
                    <span>{item.name}</span>
                  </a>
                </Link>
              </Menu.Item>
            ))
          : null}
      </Menu>
    </Sider>
  );
}
