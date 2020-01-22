import * as React from 'react';
import { GeneralInfo, ConfigurableProfilePermissions } from '../../../../common/models/profile';
import { GithubAvatar } from 'components';
import {
  Card,
  Typography,
} from 'antd';
import VisibilitySettingsDrawer from './VisibilitySettingsDrawer';

const { Title, Paragraph } = Typography;

import {
  GithubFilled,
  EnvironmentFilled,
  EditOutlined,
  SettingOutlined,
} from '@ant-design/icons';

type Props = {
  data: GeneralInfo;
  isEditingModeEnabled: boolean;
  permissionsSettings?: ConfigurableProfilePermissions;
};

type State = {
  isSettingsVisible: boolean;
}

class MainCard extends React.Component<Props, State> {
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
    const { isEditingModeEnabled, permissionsSettings } = this.props;
    const { githubId, name, locationName } = this.props.data;
    const { isSettingsVisible } = this.state;

    return (
      <>
        <Card
          actions={isEditingModeEnabled ? [
            <EditOutlined key="main-card-actions-edit"/>,
            <SettingOutlined key="main-card-actions-settings" onClick={this.showSettings} />,
          ] : undefined}
        >
          <GithubAvatar size={96} githubId={githubId} style={{ margin: '0 auto 10px', display: 'block' }} />
          <Title level={1} style={{ fontSize: 24, textAlign: 'center', margin: 0 }}>{name}</Title>
          <Paragraph style={{ textAlign: 'center', marginBottom: 20 }}>
            <a target="_blank" href={`https://github.com/${githubId}`} style={{ marginLeft: '-14px', fontSize: 16 }}>
              <GithubFilled /> {githubId}
            </a>
          </Paragraph>
          <Paragraph style={{ textAlign: 'center', margin: 0 }}>
            <span style={{ marginLeft: '-14px' }}>
              <EnvironmentFilled /> {locationName}
            </span>
          </Paragraph>
          {
            isEditingModeEnabled &&
              <VisibilitySettingsDrawer
                isSettingsVisible={isSettingsVisible}
                hideSettings={this.hideSettings}
                permissionsSettings={permissionsSettings}
              />
          }
        </Card>
      </>
    );
  }
}

export default MainCard;
