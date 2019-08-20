import * as React from 'react';

class RegistryBanner extends React.Component<any, any> {
  render() {
    return (
      <div className="activity-banner">
        <div className="alert alert-primary d-flex" role="alert">
          <div className="flex-grow-1 align-self-center alert-message">
            Do you want to take part in RS School ?
          </div>
          <a href="/registry/mentor">
            <button type="button" className="btn btn-primary">
              Yes, as mentor
            </button>
          </a>
          <div style={{ width: 20 }} />
          <a href="/registry/mentee">
            <button type="button" className="btn btn-primary">
              Yes, as mentee
            </button>
          </a>
          <div style={{ width: 20 }} />
          <button type="button" className="btn btn-secondary">
            No, don't want
          </button>
        </div>
      </div>
    );
  }
}

export { RegistryBanner }