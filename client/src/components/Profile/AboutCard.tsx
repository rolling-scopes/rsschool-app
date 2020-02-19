import * as React from 'react';
import isEqual from 'lodash/isEqual';
import { Typography, Input } from 'antd';
import CommonCard from './CommonCard';
import { GeneralInfo } from '../../../../common/models/profile';
import { ConfigurableProfilePermissions } from '../../../../common/models/profile';
import { ChangedPermissionsSettings } from 'pages/profile';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

const { Paragraph, Text } = Typography;
const { TextArea } = Input;

import { InfoCircleOutlined } from '@ant-design/icons';

type Props = {
  data: GeneralInfo;
  isEditingModeEnabled: boolean;
  permissionsSettings?: ConfigurableProfilePermissions;
  onPermissionsSettingsChange: (event: CheckboxChangeEvent, settings: ChangedPermissionsSettings) => void;
  onProfileSettingsChange: (event: any, path: string) => void;
};

class AboutCard extends React.Component<Props> {
  private filterPermissions = ({ isAboutVisible }: Partial<ConfigurableProfilePermissions>) => ({
    isAboutVisible,
  });

  shouldComponentUpdate = (nextProps: Props) =>
    !isEqual(nextProps.data.aboutMyself, this.props.data.aboutMyself) ||
    !isEqual(nextProps.permissionsSettings?.isAboutVisible, this.props.permissionsSettings?.isAboutVisible) ||
    !isEqual(nextProps.isEditingModeEnabled, this.props.isEditingModeEnabled);

  render() {
    const {
      isEditingModeEnabled,
      permissionsSettings,
      onPermissionsSettingsChange,
      onProfileSettingsChange,
    } = this.props;
    const { aboutMyself } = this.props.data;

    return (
      <CommonCard
        title="About"
        icon={<InfoCircleOutlined />}
        content={aboutMyself ? <Paragraph ellipsis={{ rows: 2, expandable: true }}>{aboutMyself}</Paragraph> : null}
        noDataDescrption="About info isn't written"
        permissionsSettings={permissionsSettings ? this.filterPermissions(permissionsSettings) : undefined}
        isEditingModeEnabled={isEditingModeEnabled}
        onPermissionsSettingsChange={onPermissionsSettingsChange}
        profileSettingsContent={
          <div>
            <p style={{ fontSize: 18, marginBottom: 5 }}>
              <Text strong>About myself:</Text>
            </p>
            <TextArea
              rows={4}
              value={aboutMyself || ''}
              onChange={(event: any) => onProfileSettingsChange(event, 'generalInfo.aboutMyself')}
            />
          </div>
        }
      />
    );
  }
}

export default AboutCard;
