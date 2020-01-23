import * as React from 'react';
import { GithubAvatar } from 'components';
import {
  Card,
  Typography,
} from 'antd';
import { GeneralInfo, ConfigurableProfilePermissions } from '../../../../common/models/profile';
import VisibilitySettingsDrawer from './VisibilitySettingsDrawer';
import { ChangedSettings } from 'pages/profile';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

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
  onSettingsChange: (event: CheckboxChangeEvent, changedSettings: ChangedSettings) => void;
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

  private filterPermissions = ({ isProfileVisible }: Partial<ConfigurableProfilePermissions>) => ({
    isProfileVisible,
  })

  render() {
    const { isEditingModeEnabled, permissionsSettings, onSettingsChange } = this.props;
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
                permissionsSettings={permissionsSettings ? this.filterPermissions(permissionsSettings) : undefined}
                onSettingsChange={onSettingsChange}
              />
          }
        </Card>
      </>
    );
  }
}

export default MainCard;
