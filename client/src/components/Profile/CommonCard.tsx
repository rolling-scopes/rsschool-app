import * as React from 'react';
import { Card, Typography, Empty } from 'antd';
import ProfileSettingsDrawer from './ProfileSettingsDrawer';

const { Title } = Typography;

import { EditOutlined } from '@ant-design/icons';

type Props = {
  profileSettingsContent?: JSX.Element;
  isEditingModeEnabled?: boolean;
  noDataDescrption?: string;
  settingsTitle?: string;
  title: string;
  icon: any;
  content: any;
  actions?: any;
  detachSettingsOnVisibilityChange?: boolean;
};

type State = {
  isProfileSettingsVisible: boolean;
};
class CommonCard extends React.Component<Props, State> {
  state = {
    isProfileSettingsVisible: false,
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
      noDataDescrption,
      settingsTitle,
      actions,
      detachSettingsOnVisibilityChange = false,
    } = this.props;
    const { isProfileSettingsVisible } = this.state;

    const renderSettingsDrawer = detachSettingsOnVisibilityChange ? isProfileSettingsVisible : true;
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
              ].filter(Boolean)
            : actions
        }
      >
        {content ? content : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={noDataDescrption} />}
        {isEditingModeEnabled !== undefined && isEditingModeEnabled && (
          <>
            {profileSettingsContent && renderSettingsDrawer && (
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
