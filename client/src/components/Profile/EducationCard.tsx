import * as React from 'react';
import {
  Typography,
  List,
} from 'antd';
import CommonCard from './CommonCard';
import { GeneralInfo } from '../../../../common/models/profile';
import { ConfigurableProfilePermissions } from '../../../../common/models/profile';
import { ChangedSettings } from 'pages/profile';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

const { Text } = Typography;

import { ReadOutlined } from '@ant-design/icons';

type Props = {
  data: GeneralInfo;
  isEditingModeEnabled: boolean;
  permissionsSettings?: ConfigurableProfilePermissions;
  onSettingsChange: (event: CheckboxChangeEvent, changedSettings: ChangedSettings) => void;
};

class EducationCard extends React.Component<Props> {
  private filterPermissions = ({ isEducationVisible }: Partial<ConfigurableProfilePermissions>) => ({
    isEducationVisible,
  })

  render() {
    const { isEditingModeEnabled, permissionsSettings, onSettingsChange } = this.props;
    const { educationHistory } = this.props.data;
    return (
      <CommonCard
        title="Education"
        icon={<ReadOutlined />}
        content={
          <List
            itemLayout="horizontal"
            dataSource={educationHistory}
            renderItem={(item: { university: string, faculty: string, graduationYear: string }) => (
              <List.Item>
                <Text strong>{item.graduationYear}</Text> {`${item.university} / ${item.faculty}`}
              </List.Item>
            )}
          />
        }
        permissionsSettings={permissionsSettings ? this.filterPermissions(permissionsSettings) : undefined}
        isEditingModeEnabled={isEditingModeEnabled}
        onSettingsChange={onSettingsChange}
      />
    );
  };
}

export default EducationCard;
