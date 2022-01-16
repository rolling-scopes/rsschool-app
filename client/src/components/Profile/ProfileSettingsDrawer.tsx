import * as React from 'react';
import { Drawer } from 'antd';

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
      <>
        <Drawer
          title={settingsTitle ?? 'Profile settings'}
          placement="top"
          closable={true}
          onClose={hideSettings}
          visible={isSettingsVisible}
          getContainer={false}
          style={{ position: 'absolute', display: isSettingsVisible ? 'block' : 'none' }}
        >
          {content}
          <style jsx>
            {`
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
            `}
          </style>
        </Drawer>
      </>
    );
  }
}

export default ProfileSettingsDrawer;
