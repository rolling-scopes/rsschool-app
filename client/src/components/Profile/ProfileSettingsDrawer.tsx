import * as React from 'react';
import { Drawer } from 'antd';
import { css } from 'styled-jsx/css';

type Props = {
  isSettingsVisible: boolean;
  hideSettings: () => void;
  content: JSX.Element;
  settingsTitle?: string;
};

class ProfileSettingsDrawer extends React.Component<Props> {
  render() {
    const { isSettingsVisible, hideSettings, content, settingsTitle } = this.props;
    return (
      <Drawer
        title={settingsTitle ?? 'Profile settings'}
        placement="top"
        closable={true}
        onClose={hideSettings}
        visible={isSettingsVisible}
        getContainer={false}
        style={{ position: 'absolute', display: isSettingsVisible ? 'block' : 'none' }}
        className={className}
      >
        {content}
        {styles}
      </Drawer>
    );
  }
}

const { className, styles } = css.resolve`
  :global(.ant-drawer-content-wrapper) {
    height: inherit !important;
  }

  :global(.ant-drawer-wrapper-body) {
    overflow: hidden;
  }

  :global(.ant-drawer-body) {
    height: calc(100% - 55px);
    overflow: auto;
  }
`;

export default ProfileSettingsDrawer;
