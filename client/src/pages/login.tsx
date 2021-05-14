import { GithubOutlined } from '@ant-design/icons';
import { Button, Card } from 'antd';
import * as React from 'react';
import { css } from 'styled-jsx/css';

const { Meta } = Card;

export default function LoginPage() {
  return (
    <main>
      <div className="login-form">
        <img className="login-image" src="/static/images/logo-rs-school.svg" alt="RS School Logo" />

        <Card
          style={{ width: 320 }}
          cover={
            <img
              className="login-card-img"
              alt="example"
              src="data:image/png;base64,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"
            />
          }
          actions={[
            <Button
              key={'github'}
              onClick={() => (window.location.href = `/api/auth/github${location.search}`)}
              size="large"
              icon={<GithubOutlined />}
              type="primary"
            >
              Sign up with GitHub
            </Button>,
          ]}
        >
          <Meta
            title="Please login via GitHub"
            description="In order to access the RS School App, you need to login with your GitHub account"
          />
        </Card>
      </div>
      <style jsx>{styles}</style>
    </main>
  );
}

const styles = css`
  .login-form {
    position: absolute;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, -65%);
    transform: translate(-50%, -65%);
    text-align: center;
  }

  @media (max-width: 767px) {
    .login-form {
      top: 20px;
      transform: translate(-50%, 0);
    }
  }

  .login-image {
    width: 100%;
    max-width: 500px;
    margin: 0 auto 50px;
  }

  .login-card-img {
    width: 100px;
    margin: 30px auto 20px;
  }
`;
