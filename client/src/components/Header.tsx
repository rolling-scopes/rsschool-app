import * as React from 'react';
import { PageHeader, Button } from 'antd';
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
              style={{ height: 30 }}
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
          <Button href="/profile" type="dashed" size="large">
            <GithubAvatar githubId={this.props.username} size={24} />
            <span style={{ marginLeft: '12px' }}>My Profile</span>
          </Button>
        </div>
      </nav>
    );
  }
}

export { Header };
