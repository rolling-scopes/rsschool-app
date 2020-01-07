import * as React from 'react';
import { Button } from 'antd';
import { GithubAvatar } from 'components/GithubAvatar';
import css from 'styled-jsx/css';

type Props = { username: string; courseName?: string; title?: string };

export function Header(props: Props) {
  return (
    <nav style={{ padding: '8px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
      <div className="logo">
        <a href="/">
          <img
            style={{ height: 30 }}
            className="header-logo"
            src="/static/images/logo-rsschool3.png"
            alt="Rolling Scopes School Logo"
          />
        </a>
      </div>
      <div className="title">
        <b>{props.title}</b> {props.courseName}
      </div>
      <div className="profile">
        <Button href="/profile" type="dashed" size="large">
          <GithubAvatar githubId={props.username} size={24} />
          <span style={{ marginLeft: '12px' }}>My Profile</span>
        </Button>
      </div>
      <style jsx>{styles}</style>
    </nav>
  );
}

const styles = css`
  .title {
    font-size: 120%;
    align-self: center;
  }
  @media all and (max-width: 540px) {
    .title {
      width: 100%;
      order: 3;
      margin-top: 16px;
    }
  }
`;
