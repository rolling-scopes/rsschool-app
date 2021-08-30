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
          <a href="/">
            <HomeOutlined />
            <span>Main</span>
          </a>
        </Menu.Item>

        {props.isAdmin ? (
          <Menu.Item key="2">
            <a href="/admin/courses">
              <GlobalOutlined />
              <span>Courses</span>
            </a>
          </Menu.Item>
        ) : null}

        {props.isAdmin || props.isCoursePowerUser ? (
          <Menu.Item key="3">
            <a href="/admin/interview-questions">
              <QuestionOutlined />
              <span>Interview questions</span>
            </a>
          </Menu.Item>
        ) : null}

        <Menu.Item key="4">
          <a href="/admin/tasks">
            <AlertOutlined />
            <span>Tasks</span>
          </a>
        </Menu.Item>

        <Menu.Item key="5">
          <a href="/admin/events">
            <BellOutlined />
            <span>Events</span>
          </a>
        </Menu.Item>

        {props.isAdmin ? (
          <Menu.Item key="6">
            <a href="/admin/users">
              <UserOutlined />
              <span>Users</span>
            </a>
          </Menu.Item>
        ) : null}

        {props.isAdmin || props.isCoursePowerUser ? (
          <Menu.Item key="7">
            <a href="/admin/mentor-registry">
              <IdcardFilled />
              <span>Mentor Registry</span>
            </a>
          </Menu.Item>
        ) : null}

        {props.isAdmin ? (
          <Menu.Item key="8">
            <a href="/admin/discord-server">
              <RobotFilled />
              <span>Discord Servers</span>
            </a>
          </Menu.Item>
        ) : null}

        {props.isAdmin ? (
          <Menu.Item key="9">
            <a href="/admin/user-group">
              <TeamOutlined />
              <span>User Groups</span>
            </a>
          </Menu.Item>
        ) : null}
      </Menu>
    </Sider>
  );
}
