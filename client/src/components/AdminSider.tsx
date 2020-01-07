import {
  BellOutlined,
  GlobalOutlined,
  IdcardOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  OrderedListOutlined,
  QuestionOutlined,
  TeamOutlined,
  IdcardFilled,
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import * as React from 'react';

const { Sider } = Layout;

type State = { collapsed: boolean };

class AdminSider extends React.Component<any, any> {
  state: State = {
    collapsed: true,
  };

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  render() {
    const menuIconProps = {
      onClick: this.toggle,
      style: { fontSize: '20px', display: 'block', lineHeight: '30px', padding: '20px 32px' },
    };
    return (
      <Sider trigger={null} collapsible collapsed={this.state.collapsed} theme="dark">
        <h4>
          <span>Admin Area</span>
          {this.state.collapsed ? <MenuUnfoldOutlined {...menuIconProps} /> : <MenuFoldOutlined {...menuIconProps} />}
        </h4>

        <Menu theme="dark" mode="inline">
          <Menu.Item key="1">
            <a href="/admin/courses">
              <GlobalOutlined />
              <span>Courses</span>
            </a>
          </Menu.Item>

          <Menu.Item key="2">
            <a href="/admin/stages">
              <OrderedListOutlined />
              <span>Stages</span>
            </a>
          </Menu.Item>

          <Menu.Item key="3">
            <a href="/admin/tasks">
              <QuestionOutlined />
              <span>Tasks</span>
            </a>
          </Menu.Item>

          <Menu.Item key="4">
            <a href="/admin/events">
              <BellOutlined />
              <span>Events</span>
            </a>
          </Menu.Item>

          <Menu.Item key="5">
            <a href="/admin/users">
              <TeamOutlined />
              <span>Users</span>
            </a>
          </Menu.Item>

          <Menu.Item key="6">
            <a href="/admin/registrations">
              <IdcardOutlined />
              <span>Registrations</span>
            </a>
          </Menu.Item>

          <Menu.Item key="7">
            <a href="/admin/mentor-registry">
              <IdcardFilled />
              <span>Mentor Registry</span>
            </a>
          </Menu.Item>
        </Menu>
      </Sider>
    );
  }
}

export { AdminSider };
