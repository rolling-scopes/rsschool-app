import * as React from 'react';
import {
  Card,
  Typography,
} from 'antd';
import { ConfigurableProfilePermissions } from '../../../../common/models/profile';
import VisibilitySettingsDrawer from './VisibilitySettingsDrawer';

const { Title } = Typography;

import {
  EditOutlined,
  SettingOutlined,
} from '@ant-design/icons';

type Props = {
  permissionsSettings?: Partial<ConfigurableProfilePermissions>;
  isEditingModeEnabled?: boolean;
  title: string;
  icon: any;
  content: any;
  actions?: any;
};

type State = {
  isSettingsVisible: boolean;
}
class CommonCard extends React.Component<Props, State> {
  state = {
    isSettingsVisible: false,
  }

  private showSettings = () => {
    this.setState({ isSettingsVisible: true });
  }

  private hideSettings = () => {
    this.setState({ isSettingsVisible: false });
  }

  render() {
    const { title, icon, content, isEditingModeEnabled, permissionsSettings } = this.props;
    const { isSettingsVisible } = this.state;

    return (
      <Card
        title={
          <Title
            level={2}
            ellipsis={true}
            style={{ fontSize: 16, marginBottom: 0 }}
          >
            {icon} {title}
          </Title>
        }
        actions={isEditingModeEnabled ? [
          <EditOutlined key="main-card-actions-edit"/>,
          <SettingOutlined key="main-card-actions-settings" onClick={this.showSettings} />,
        ] : undefined}
      >
        {content}
        {
            isEditingModeEnabled !== undefined && isEditingModeEnabled &&
              <VisibilitySettingsDrawer
                isSettingsVisible={isSettingsVisible}
                hideSettings={this.hideSettings}
                permissionsSettings={permissionsSettings}
              />
          }
      </Card>
    );
  }
}

export default CommonCard;
