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
  ProfileFilled,
  NotificationFilled,
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import Link from 'next/link';
import { useState } from 'react';
import { featureToggles } from 'services/features';

const { Sider } = Layout;

type Props = { isAdmin?: boolean; isCoursePowerUser?: boolean; isHirer?: boolean };

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
          <Link prefetch={false} href="/">
            <a>
              <HomeOutlined />
              <span>Main</span>
            </a>
          </Link>
        </Menu.Item>

        {props.isAdmin ? (
          <Menu.Item key="2">
            <Link prefetch={false} href="/admin/courses">
              <a>
                <GlobalOutlined />
                <span>Courses</span>
              </a>
            </Link>
          </Menu.Item>
        ) : null}

        {props.isAdmin || props.isCoursePowerUser ? (
          <Menu.Item key="3">
            <Link prefetch={false} href="/admin/interview-questions">
              <a>
                <QuestionOutlined />
                <span>Interview questions</span>
              </a>
            </Link>
          </Menu.Item>
        ) : null}

        <Menu.Item key="4">
          <Link prefetch={false} href="/admin/tasks">
            <a>
              <AlertOutlined />
              <span>Tasks</span>
            </a>
          </Link>
        </Menu.Item>

        <Menu.Item key="5">
          <Link prefetch={false} href="/admin/events">
            <a>
              <BellOutlined />
              <span>Events</span>
            </a>
          </Link>
        </Menu.Item>

        {props.isAdmin ? (
          <Menu.Item key="6">
            <Link prefetch={false} href="/admin/users">
              <a>
                <UserOutlined />
                <span>Users</span>
              </a>
            </Link>
          </Menu.Item>
        ) : null}

        {props.isAdmin || props.isCoursePowerUser ? (
          <Menu.Item key="7">
            <Link prefetch={false} href="/admin/mentor-registry">
              <a>
                <IdcardFilled />
                <span>Mentor Registry</span>
              </a>
            </Link>
          </Menu.Item>
        ) : null}

        {props.isAdmin ? (
          <Menu.Item key="8">
            <Link prefetch={false} href="/admin/discord-server">
              <a>
                <RobotFilled />
                <span>Discord Servers</span>
              </a>
            </Link>
          </Menu.Item>
        ) : null}

        {props.isAdmin ? (
          <Menu.Item key="9">
            <Link prefetch={false} href="/admin/user-group">
              <a>
                <TeamOutlined />
                <span>User Groups</span>
              </a>
            </Link>
          </Menu.Item>
        ) : null}

        {props.isAdmin || props.isHirer ? (
          <Menu.Item key="10">
            <a href="/employer">
              <ProfileFilled />
              <span>Employer Page</span>
            </a>
          </Menu.Item>
        ) : null}

        {featureToggles.notifications && (props.isAdmin || props.isCoursePowerUser) ? (
          <Menu.Item key="11">
            <Link prefetch={false} href="/admin/notifications">
              <a>
                <NotificationFilled />
                <span>Notifications</span>
              </a>
            </Link>
          </Menu.Item>
        ) : null}
      </Menu>
    </Sider>
  );
}
