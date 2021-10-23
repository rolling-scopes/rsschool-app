import * as React from 'react';
import { Card, Typography, Empty } from 'antd';
import { ConfigurableProfilePermissions } from 'common/models/profile';
import PermissionsSettingsDrawer from './PermissionsSettingsDrawer';
import ProfileSettingsDrawer from './ProfileSettingsDrawer';
import { ChangedPermissionsSettings } from 'pages/profile';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

const { Title } = Typography;

import { EditOutlined, SettingOutlined } from '@ant-design/icons';

type Props = {
  permissionsSettings?: Partial<ConfigurableProfilePermissions>;
  profileSettingsContent?: JSX.Element;
  isEditingModeEnabled?: boolean;
  noDataDescrption?: string;
  settingsTitle?: string;
  title: string;
  icon: any;
  content: any;
  actions?: any;
  onPermissionsSettingsChange?: (event: CheckboxChangeEvent, settings: ChangedPermissionsSettings) => void;
};

type State = {
  isVisibilitySettingsVisible: boolean;
  isProfileSettingsVisible: boolean;
};
class CommonCard extends React.Component<Props, State> {
  state = {
    isVisibilitySettingsVisible: false,
    isProfileSettingsVisible: false,
  };

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

  render() {
    const {
      title,
      icon,
      content,
      profileSettingsContent,
      isEditingModeEnabled,
      permissionsSettings,
      noDataDescrption,
      settingsTitle,
      onPermissionsSettingsChange,
      actions,
    } = this.props;
    const { isVisibilitySettingsVisible, isProfileSettingsVisible } = this.state;

    return (
      <Card
        title={
          <Title level={2} ellipsis={true} style={{ fontSize: 16, marginBottom: 0 }}>
            {icon} {title}
          </Title>
        }
        actions={
          isEditingModeEnabled
            ? [
                profileSettingsContent && (
                  <EditOutlined key="main-card-actions-edit" onClick={this.showProfileSettings} />
                ),
                permissionsSettings && (
                  <SettingOutlined key="main-card-actions-settings" onClick={this.showVisibilitySettings} />
                ),
              ].filter(Boolean)
            : actions
        }
      >
        {content ? content : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={noDataDescrption} />}
        {isEditingModeEnabled !== undefined && isEditingModeEnabled && (
          <>
            <PermissionsSettingsDrawer
              isSettingsVisible={isVisibilitySettingsVisible}
              hideSettings={this.hideVisibilitySettings}
              permissionsSettings={permissionsSettings}
              onPermissionsSettingsChange={onPermissionsSettingsChange}
            />
            {profileSettingsContent && (
              <ProfileSettingsDrawer
                isSettingsVisible={isProfileSettingsVisible}
                hideSettings={this.hideProfileSettings}
                settingsTitle={settingsTitle}
                content={profileSettingsContent}
              />
            )}
          </>
        )}
      </Card>
    );
  }
}

export default CommonCard;
