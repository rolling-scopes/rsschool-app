import * as React from 'react';
import { ConfigurableProfilePermissions } from '../../../../common/models/profile';
import {
  Drawer,
  Checkbox,
} from 'antd';

type Props = {
  isSettingsVisible: boolean;
  hideSettings: () => void;
  permissionsSettings?: ConfigurableProfilePermissions;
};

class VisibilitySettingsDrawer extends React.Component<Props> {
  render() {
    const { isSettingsVisible, hideSettings } = this.props;
    return (
      <Drawer
        title="Who can see my profile?"
        placement="top"
        closable={true}
        onClose={hideSettings}
        visible={isSettingsVisible}
        getContainer={false}
        style={{ position: 'absolute', display: isSettingsVisible ? 'block' : 'none' }}
      >
        <Checkbox>Nobody</Checkbox>
      </Drawer>
    );
  }
}

export default VisibilitySettingsDrawer;
