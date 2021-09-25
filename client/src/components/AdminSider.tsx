import {
  BellOutlined,
  GlobalOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AlertOutlined,
  QuestionOutlined,
  TeamOutlined,
  IdcardFilled,
  HomeOutlined,
  RobotFilled,
  UserOutlined,
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import Link from 'next/link';
import { useState } from 'react';

const { Sider } = Layout;

type Props = { isAdmin?: boolean; isCoursePowerUser?: boolean };

export function AdminSider(props: Props) {
  const [collapsed, setCollapsed] = useState(true);

  const menuIconProps = {
    onClick: () => {
      setCollapsed(!collapsed);
    },
    style: { fontSize: '20px', display: 'block', lineHeight: '30px', padding: '20px 32px' },
  };
  return (
    <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
      <h4>
        <span>Admin Area</span>
        {collapsed ? <MenuUnfoldOutlined {...menuIconProps} /> : <MenuFoldOutlined {...menuIconProps} />}
      </h4>

      <Menu theme="dark" mode="inline">
        <Menu.Item key="1">
          <Link href="/">
            <a>
              <HomeOutlined />
              <span>Main</span>
            </a>
          </Link>
        </Menu.Item>

        {props.isAdmin ? (
          <Menu.Item key="2">
            <Link href="/admin/courses">
              <a>
                <GlobalOutlined />
                <span>Courses</span>
              </a>
            </Link>
          </Menu.Item>
        ) : null}

        {props.isAdmin || props.isCoursePowerUser ? (
          <Menu.Item key="3">
            <Link href="/admin/technical-interviews">
              <a>
                <QuestionOutlined />
                <span>Technical interviews</span>
              </a>
            </Link>
          </Menu.Item>
        ) : null}

        <Menu.Item key="4">
          <Link href="/admin/tasks">
            <a>
              <AlertOutlined />
              <span>Tasks</span>
            </a>
          </Link>
        </Menu.Item>

        <Menu.Item key="5">
          <Link href="/admin/events">
            <a>
              <BellOutlined />
              <span>Events</span>
            </a>
          </Link>
        </Menu.Item>

        {props.isAdmin ? (
          <Menu.Item key="6">
            <Link href="/admin/users">
              <a>
                <UserOutlined />
                <span>Users</span>
              </a>
            </Link>
          </Menu.Item>
        ) : null}

        {props.isAdmin || props.isCoursePowerUser ? (
          <Menu.Item key="7">
            <Link href="/admin/mentor-registry">
              <a>
                <IdcardFilled />
                <span>Mentor Registry</span>
              </a>
            </Link>
          </Menu.Item>
        ) : null}

        {props.isAdmin ? (
          <Menu.Item key="8">
            <Link href="/admin/discord-server">
              <a>
                <RobotFilled />
                <span>Discord Servers</span>
              </a>
            </Link>
          </Menu.Item>
        ) : null}

        {props.isAdmin ? (
          <Menu.Item key="9">
            <Link href="/admin/user-group">
              <a>
                <TeamOutlined />
                <span>User Groups</span>
              </a>
            </Link>
          </Menu.Item>
        ) : null}
      </Menu>
    </Sider>
  );
}
