import * as React from 'react';
import isEqual from 'lodash/isEqual';
import { GithubAvatar } from 'components/GithubAvatar';
import { Card, Typography, Input, Row, Col } from 'antd';
import { ConfigurableProfilePermissions } from 'common/models/profile';
import { ChangedPermissionsSettings } from 'pages/profile';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { LocationSelect } from 'components/Forms';
import PermissionsSettingsDrawer from './PermissionsSettingsDrawer';
import ProfileSettingsDrawer from './ProfileSettingsDrawer';

const { Title, Paragraph, Text } = Typography;

import { GithubFilled, EnvironmentFilled, EditOutlined, SettingOutlined } from '@ant-design/icons';
import { ProfileInfo } from 'services/user';

type Props = {
  data: ProfileInfo;
  isEditingModeEnabled: boolean;
  permissionsSettings?: ConfigurableProfilePermissions;
  onPermissionsSettingsChange: (event: CheckboxChangeEvent, settings: ChangedPermissionsSettings) => void;
  onProfileSettingsChange: (event: any, path: string) => void;
};

type State = {
  isVisibilitySettingsVisible: boolean;
  isProfileSettingsVisible: boolean;
};

class MainCard extends React.Component<Props, State> {
  state: State = {
    isVisibilitySettingsVisible: false,
    isProfileSettingsVisible: false,
  };

  shouldComponentUpdate = (nextProps: Props, nextState: State) =>
    !isEqual(nextProps.data.generalInfo?.location.cityName, this.props.data.generalInfo?.location.cityName) ||
    !isEqual(nextProps.data.generalInfo?.location.countryName, this.props.data.generalInfo?.location.countryName) ||
    !isEqual(nextProps.data.generalInfo?.name, this.props.data.generalInfo?.name) ||
    !isEqual(nextProps.permissionsSettings?.isProfileVisible, this.props.permissionsSettings?.isProfileVisible) ||
    !isEqual(nextProps.isEditingModeEnabled, this.props.isEditingModeEnabled) ||
    !isEqual(nextState, this.state);

  private showVisibilitySettings = () => {
    this.setState({ isVisibilitySettingsVisible: true });
  };

  private hideVisibilitySettings = () => {
    this.setState({ isVisibilitySettingsVisible: false });
  };

  private showProfileSettings = () => {
    this.setState({ isProfileSettingsVisible: true });
  };

  private hideProfileSettings = () => {
    this.setState({ isProfileSettingsVisible: false });
  };
  private filterPermissions = ({ isProfileVisible }: Partial<ConfigurableProfilePermissions>) => ({
    isProfileVisible,
  });

  render() {
    const { isEditingModeEnabled, permissionsSettings, onPermissionsSettingsChange, onProfileSettingsChange } =
      this.props;
    const { githubId, name, location } = this.props.data.generalInfo ?? {};
    const publicCvUrl = this.props.data.publicCvUrl;
    const { isProfileSettingsVisible, isVisibilitySettingsVisible } = this.state;

    return (
      <>
        <Card
          actions={
            isEditingModeEnabled
              ? [
                  <EditOutlined key="main-card-actions-edit" onClick={this.showProfileSettings} />,
                  <SettingOutlined key="main-card-actions-settings" onClick={this.showVisibilitySettings} />,
                ]
              : undefined
          }
        >
          <GithubAvatar size={96} githubId={githubId} style={{ margin: '0 auto 10px', display: 'block' }} />
          <Title level={1} style={{ fontSize: 24, textAlign: 'center', margin: 0 }}>
            {name}
          </Title>

          <Paragraph style={{ textAlign: 'center', marginBottom: 20 }}>
            <a target="_blank" href={`https://github.com/${githubId}`} style={{ marginLeft: '-14px', fontSize: 16 }}>
              <GithubFilled /> {githubId}
            </a>
          </Paragraph>

          <Paragraph style={{ textAlign: 'center', margin: 0 }}>
            <span style={{ marginLeft: '-14px' }}>
              <EnvironmentFilled /> {`${location?.cityName}, ${location?.countryName}`}
            </span>
          </Paragraph>
          <Paragraph style={{ textAlign: 'center', marginTop: 20 }}>
            <a target="_blank" href={`${publicCvUrl}`}>
              Public CV
            </a>
          </Paragraph>
          {isEditingModeEnabled && (
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
                  <Row>
                    <Col>
                      <Row>
                        <Text strong>Name</Text>
                      </Row>
                      <Row style={{ marginTop: 4 }}>
                        <Input
                          value={name}
                          placeholder="Firstname Lastname"
                          onChange={(event: any) => onProfileSettingsChange(event, 'generalInfo.name')}
                        />
                      </Row>

                      <Row style={{ marginTop: 24 }}>
                        <Text strong>Location</Text>
                      </Row>
                      <Row style={{ marginTop: 4 }}>
                        <LocationSelect
                          style={{ flex: 1 }}
                          onChange={location => onProfileSettingsChange(location, 'generalInfo.location')}
                          location={location ?? null}
                        />
                      </Row>
                    </Col>
                  </Row>
                }
              />
            </>
          )}
        </Card>
      </>
    );
  }
}

export default MainCard;
