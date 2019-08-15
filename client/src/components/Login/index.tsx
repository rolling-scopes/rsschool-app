import * as React from 'react';

import './index.scss';

class Login extends React.Component {
  render() {
    return (
      <main>
        <div className="login-form">
          <img className="login-image" src="/static/images/logo-rsschool2.png" alt="RS Logo" />
          <div className="text-right mt-5 pt-5">
            <a href="/api/auth/github" className="btn btn-success">
              Sign up with GitHub
            </a>
          </div>
        </div>
        <div className="container">
          <div className="row partner-list">
            <div className="col-4 d-flex align-items-center">
              <a href="https://epam.by/">
                <img className="partner-image" src="/static/images/logo-epam.svg" alt="EPAM logo" />
              </a>
            </div>
            <div className="col-4 d-flex align-items-center">
              <a href="https://github.com/">
                <img className="partner-image" src="/static/images/logo-github.png" alt="Github logo" />
              </a>
            </div>
            <div className="col-4 d-flex align-items-center">
              <a href="https://imaguru.co/">
                <img className="partner-image" src="/static/images/logo-imaguru.svg" alt="Imaguru logo" />
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }
}

export default Login;
