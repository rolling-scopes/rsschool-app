import { Button, Col, Row } from 'antd';

import * as React from 'react';
import css from 'styled-jsx/css';

class LoginPage extends React.PureComponent {
  render() {
    return (
      <main>
        <div className="login-form">
          <img className="login-image" src="/static/images/logo-rsschool2.png" alt="RS Logo" />
          <div className="text-right mt-5 pt-5">
            <Button
              onClick={() => (window.location.href = '/api/auth/github')}
              size="large"
              icon="github"
              type="primary"
            >
              Sign up with GitHub
            </Button>
          </div>
        </div>
        <div className="container">
          <Row className="partner-list">
            <Col span={8}>
              <Row type="flex" justify="center">
                <a style={{ padding: '15px ' }} href="https://epam.by/">
                  <img
                    style={{ height: '45px' }}
                    className="partner-image"
                    src="/static/images/logo-epam.svg"
                    alt="EPAM logo"
                  />
                </a>
              </Row>
            </Col>
            <Col span={8}>
              <Row type="flex" justify="center">
                <a href="https://github.com/">
                  <img
                    style={{ width: '150px' }}
                    className="partner-image"
                    src="/static/images/logo-github.png"
                    alt="Github logo"
                  />
                </a>
              </Row>
            </Col>
            <Col span={8}>
              <Row type="flex" justify="center">
                <a href="https://imaguru.co/">
                  <img
                    style={{ width: '150px', height: '60px' }}
                    className="partner-image"
                    src="/static/images/logo-imaguru.svg"
                    alt="Imaguru logo"
                  />
                </a>
              </Row>
            </Col>
          </Row>
        </div>
        <style jsx>{styles}</style>
      </main>
    );
  }
}

const styles = css`
  .login-form {
    position: absolute;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    text-align: center;
  }

  .login-image {
    max-width: 500px;
  }

  .partner-list {
    align-items: center;
  }

  .partner-image {
    max-width: 200px;
    vertical-align: middle;
    opacity: 0.2;
  }
`;

export default LoginPage;
