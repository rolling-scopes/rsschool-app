import * as React from 'react';
import {
  Typography,
} from 'antd';
import CommonCard from './CommonCard';
import { GeneralInfo } from '../../../../common/models/profile';
import { ConfigurableProfilePermissions } from '../../../../common/models/profile';

const { Paragraph } = Typography;

import { InfoCircleOutlined } from '@ant-design/icons';

type Props = {
  data: GeneralInfo;
  isEditingModeEnabled: boolean;
  permissionsSettings?: ConfigurableProfilePermissions;
};

class AboutCard extends React.Component<Props> {
  private filterPermissions = ({ isAboutVisible }: Partial<ConfigurableProfilePermissions>) => ({
    isAboutVisible,
  });

  render() {
    const { isEditingModeEnabled, permissionsSettings } = this.props;
    const { aboutMyself } = this.props.data;
    return (
      <CommonCard
        title="About"
        icon={<InfoCircleOutlined />}
        content={<Paragraph ellipsis={{ rows: 2, expandable: true }}>{aboutMyself}</Paragraph>}
        permissionsSettings={permissionsSettings ? this.filterPermissions(permissionsSettings) : undefined}
        isEditingModeEnabled={isEditingModeEnabled}
      />
    );
  }
}

export default AboutCard;
