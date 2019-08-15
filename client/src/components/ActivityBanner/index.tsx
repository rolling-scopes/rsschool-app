import * as React from 'react';
import axios from 'axios';

import './index.scss';

const defaultIdleTime = 1000 * 60 * 60 * 24 * 7; // 7 days

class ActivityBanner extends React.Component<any, any> {
  now = Date.now();

  state = {
    lastActivityTime: -1,
  };

  async componentDidMount() {
    const response = await axios.get('/api/activity');
    this.setState({ lastActivityTime: response.data.data.lastActivityTime });
  }

  private onUpdateUserActivity = async (isActive: boolean) => {
    const response = await axios.post('/api/activity', { isActive });
    this.setState({ lastActivityTime: response.data.data.lastActivityTime });
  };

  render() {
    if (this.state.lastActivityTime < 0) {
      return null;
    }
    const isShown = this.state.lastActivityTime < this.now - defaultIdleTime;
    return (
      <div className="activity-banner">
        {isShown && (
          <div className="alert alert-primary d-flex" role="alert">
            <div className="flex-grow-1 align-self-center alert-message">
              Are you ACTIVE student or mentor and want to continue to take part in RS School ?
            </div>
            <button type="button" onClick={() => this.onUpdateUserActivity(true)} className="btn btn-primary">
              Yes, Active
            </button>
            <div style={{ width: 20 }} />
            <button type="button" onClick={() => this.onUpdateUserActivity(false)} className="btn btn-secondary">
              No, NOT Active
            </button>
          </div>
        )}
      </div>
    );
  }
}

export { ActivityBanner };
