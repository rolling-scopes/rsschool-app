import * as React from 'react';
import isEqual from 'lodash/isEqual';
import { GithubAvatar } from 'components';
import {
  Card,
  Typography,
  Input,
} from 'antd';
import { GeneralInfo, ConfigurableProfilePermissions } from '../../../../common/models/profile';
import { ChangedPermissionsSettings } from 'pages/profile';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import PermissionsSettingsDrawer from './PermissionsSettingsDrawer';
import ProfileSettingsDrawer from './ProfileSettingsDrawer';
import { LocationSelect } from '../LocationSelect';

const { Title, Paragraph, Text } = Typography;

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
  onPermissionsSettingsChange: (event: CheckboxChangeEvent, settings: ChangedPermissionsSettings) => void;
  onProfileSettingsChange: (event: any, path: string) => void;
};

type State = {
  isVisibilitySettingsVisible: boolean;
  isProfileSettingsVisible: boolean;
}

class MainCard extends React.Component<Props, State> {
  state = {
    isVisibilitySettingsVisible: false,
    isProfileSettingsVisible: false,
  }

  shouldComponentUpdate = (nextProps: Props, nextState: State) => (
    !isEqual(nextProps.data.locationId, this.props.data.locationId) ||
    !isEqual(nextProps.data.name, this.props.data.name) ||
    !isEqual(nextProps.permissionsSettings?.isProfileVisible, this.props.permissionsSettings?.isProfileVisible) ||
    nextState !== this.state
  );

  private showVisibilitySettings = () => {
    this.setState({ isVisibilitySettingsVisible: true });
  }

  private hideVisibilitySettings = () => {
    this.setState({ isVisibilitySettingsVisible: false });
  }

  private showProfileSettings = () => {
    this.setState({ isProfileSettingsVisible: true });
  }

  private hideProfileSettings = () => {
    this.setState({ isProfileSettingsVisible: false });
  }
  private filterPermissions = ({ isProfileVisible }: Partial<ConfigurableProfilePermissions>) => ({
    isProfileVisible,
  })

  render() {
    const { isEditingModeEnabled, permissionsSettings, onPermissionsSettingsChange } = this.props;
    const { githubId, name, locationName, locationId } = this.props.data;
    const { isProfileSettingsVisible, isVisibilitySettingsVisible } = this.state;

    return (
      <>
        <Card
          actions={isEditingModeEnabled ? [
            <EditOutlined key="main-card-actions-edit" onClick={this.showProfileSettings}/>,
            <SettingOutlined key="main-card-actions-settings" onClick={this.showVisibilitySettings} />,
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
              <>
                <PermissionsSettingsDrawer
                  isSettingsVisible={isVisibilitySettingsVisible}
                  hideSettings={this.hideVisibilitySettings}
                  permissionsSettings={permissionsSettings ? this.filterPermissions(permissionsSettings) : undefined}
                  onPermissionsSettingsChange={onPermissionsSettingsChange}
                />
                <ProfileSettingsDrawer
                  isSettingsVisible={isProfileSettingsVisible}
                  hideSettings={this.hideProfileSettings}
                  content={
                    <div>
                      <p style={{ fontSize: 18, marginBottom: 5 }}><Text strong>Name:</Text></p>
                      <p style={{ marginBottom: 20 }}>
                        <Input value={name} placeholder="Firstname Lastname"/>
                      </p>
                      <p style={{ fontSize: 18, marginBottom: 5 }}><Text strong>Location:</Text></p>
                      <div style={{ marginBottom: 5 }}>
                        <LocationSelect style={{ width: '100%' }} defaultValue={locationId} />
                      </div>
                    </div>
                  }
                />
              </>
          }
        </Card>
      </>
    );
  }
}

export default MainCard;
