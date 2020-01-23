import * as React from 'react';
import {
  Typography,
} from 'antd';
import CommonCard from './CommonCard';
import { GeneralInfo } from '../../../../common/models/profile';
import { ConfigurableProfilePermissions } from '../../../../common/models/profile';

const { Text } = Typography;

import { TagOutlined } from '@ant-design/icons';

type Props = {
  data: GeneralInfo;
  isEditingModeEnabled: boolean;
  permissionsSettings?: ConfigurableProfilePermissions;
};

class EnglishCard extends React.Component<Props> {
  private filterPermissions = ({ isEnglishVisible }: Partial<ConfigurableProfilePermissions>) => ({
    isEnglishVisible,
  })

  render() {
    const { isEditingModeEnabled, permissionsSettings } = this.props;
    const { englishLevel } = this.props.data;
    return (
      <CommonCard
        title="Estimated English level"
        icon={<TagOutlined />}
        content={<Text style={{ textTransform: 'capitalize', fontSize: '48px' }}>{englishLevel}</Text>}
        permissionsSettings={permissionsSettings ? this.filterPermissions(permissionsSettings) : undefined}
        isEditingModeEnabled={isEditingModeEnabled}
      />
    );
  }
}

export default EnglishCard;
