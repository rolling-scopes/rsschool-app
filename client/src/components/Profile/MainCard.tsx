import * as React from 'react';
import { GeneralInfo } from '../../../../common/models/profile';
import { GithubAvatar } from 'components';
import {
  Card,
  Typography,
  Drawer,
  Checkbox,
} from 'antd';

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
    const { githubId, name, locationName } = this.props.data;
    const { isSettingsVisible } = this.state;

    return (
      <>

        <Card
          actions={[
            <EditOutlined key="main-card-actions-edit"/>,
            <SettingOutlined key="main-card-actions-settings" onClick={this.showSettings} />,
          ]}
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
          <Drawer
            title="Who can see my profile?"
            placement="top"
            closable={true}
            onClose={this.hideSettings}
            visible={isSettingsVisible}
            getContainer={false}
            style={{ position: 'absolute', display: isSettingsVisible ? 'block' : 'none' }}
          >
            <Checkbox>Nobody</Checkbox>
          </Drawer>
        </Card>
      </>
    );
  }
}

export default MainCard;
