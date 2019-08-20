import * as React from 'react';
import { Dropdown, Menu, PageHeader } from 'antd';
import { GithubAvatar } from 'components/GithubAvatar';

type Props = {
  username: string;
  courseName?: string;
  title?: string;
};

class Header extends React.PureComponent<Props> {
  render() {
    return (
      <nav className="p-2 d-flex justify-content-between">
        <div>
          <a href="/">
            <img
              style={{ height: 60 }}
              className="header-logo"
              src="/static/images/logo-rsschool3.png"
              alt="Rolling Scopes School Logo"
            />
          </a>
        </div>
        <div>
          <PageHeader title={this.props.title} subTitle={this.props.courseName} />
        </div>
        <div>
          <Dropdown overlay={this.getMenu()}>
            <div className="d-flex flex-column align-items-center">
              <GithubAvatar githubId={this.props.username} size={24} />
              <div>{this.props.username}</div>
            </div>
          </Dropdown>
        </div>
      </nav>
    );
  }

  getMenu() {
    return (
      <Menu>
        <Menu.Item>
          <a href="/profile">My Profile</a>
        </Menu.Item>
      </Menu>
    );
  }
}

export { Header };
