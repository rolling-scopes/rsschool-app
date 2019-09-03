import * as React from 'react';
import axios from 'axios';
import { notification, Button } from 'antd';

const defaultIdleTime = 1000 * 60 * 60 * 24 * 7; // 7 days

class ActivityBanner extends React.Component<any, any> {
  now = Date.now();
  timerRef: any = null;

  state = {
    lastActivityTime: -1,
  };

  async componentDidMount() {
    const response = await axios.get('/api/activity');
    const isShown = response.data.data.lastActivityTime < this.now - defaultIdleTime;
    if (isShown) {
      this.timerRef = setTimeout(() => this.openNotification(), 2000);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timerRef);
  }

  private openNotification = () => {
    const key = `open${Date.now()}`;
    const btn = (
      <Button
        type="primary"
        onClick={async () => {
          this.updateUserActivity(true);
          notification.close(key);
        }}
      >
        Yes, Active
      </Button>
    );
    const args = {
      message: '',
      description: 'Are you ACTIVE student or mentor and want to continue to take part in RS School ?',
      duration: 0,
      btn,
      key,
      onClose: async () => await this.updateUserActivity(false),
    };
    notification.open(args);
  };

  private updateUserActivity = async (isActive: boolean) => {
    await axios.post('/api/activity', { isActive });
  };

  render() {
    return <div className="activity-banner" />;
  }
}

export { ActivityBanner };
