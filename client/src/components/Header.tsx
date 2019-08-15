import * as React from 'react';
import { DropdownToggle, DropdownMenu, DropdownItem, ButtonDropdown } from 'reactstrap';
import Router from 'next/router';
import { GithubAvatar } from 'components/UserSelect';

type Props = {
  username: string;
  courseName?: string;
  title?: string;
};

type State = {
  isProfileMenuOpen: boolean;
};

class Header extends React.Component<Props, State> {
  state: State = {
    isProfileMenuOpen: false,
  };

  private onProfileMenuToggle = () => {
    this.setState({ isProfileMenuOpen: !this.state.isProfileMenuOpen });
  };

  render() {
    return (
      <nav className="navbar navbar-light header-nav p-2">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">
            <img
              style={{ height: 60 }}
              className="header-logo"
              src="/static/images/logo-rsschool.svg"
              alt="Rolling Scopes School Logo"
            />
          </a>
          {this.props.title && <h4>{this.props.title}</h4>}

          <div className="d-flex align-items-center">
            <div className="text-primary">{this.props.courseName}</div>
            <ButtonDropdown isOpen={this.state.isProfileMenuOpen} toggle={this.onProfileMenuToggle}>
              <DropdownToggle caret={true}>
                <GithubAvatar githubId={this.props.username} />
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem onClick={() => Router.push('/profile')}>My Profile</DropdownItem>
              </DropdownMenu>
            </ButtonDropdown>
          </div>
        </div>
      </nav>
    );
  }
}

export { Header };
