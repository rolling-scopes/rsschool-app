import * as React from 'react';
import { Menu, Icon, Layout } from 'antd';

const { Sider } = Layout;

type State = {
  collapsed: boolean;
};

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
    return (
      <Sider trigger={null} collapsible collapsed={this.state.collapsed} theme="dark">
        <h4>
          <span>Admin Area</span>
          <Icon
            style={{ fontSize: '20px', lineHeight: '30px', padding: '20px 32px' }}
            className="trigger"
            type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
            onClick={this.toggle}
          />
        </h4>

        <Menu theme="dark" mode="inline">
          <Menu.Item key="1">
            <a href="/admin/courses">
              <Icon type="global" />
              <span>Courses</span>
            </a>
          </Menu.Item>

          <Menu.Item key="2">
            <a href="/admin/stages">
              <Icon type="ordered-list" />
              <span>Stages</span>
            </a>
          </Menu.Item>

          <Menu.Item key="3">
            <a href="/admin/tasks">
              <Icon type="question" />
              <span>Tasks</span>
            </a>
          </Menu.Item>

          <Menu.Item key="4">
            <a href="/admin/events">
              <Icon type="bell" />
              <span>Events</span>
            </a>
          </Menu.Item>

          <Menu.Item key="5">
            <a href="/admin/users">
              <Icon type="team" />
              <span>Users</span>
            </a>
          </Menu.Item>

          <Menu.Item key="6">
            <a href="/admin/registrations">
              <Icon type="idcard" />
              <span>Registrations</span>
            </a>
          </Menu.Item>
        </Menu>
      </Sider>
    );
  }
}

export { AdminSider };
