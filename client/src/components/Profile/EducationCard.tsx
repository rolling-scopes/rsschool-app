import * as React from 'react';
import isEqual from 'lodash/isEqual';
import {
  Typography,
  List,
  Input,
  Button,
} from 'antd';
import CommonCard from './CommonCard';
import { GeneralInfo } from '../../../../common/models/profile';
import { ConfigurableProfilePermissions } from '../../../../common/models/profile';
import { ChangedPermissionsSettings } from 'pages/profile';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

const { Text } = Typography;

import {
  ReadOutlined,
  FileAddOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

type Props = {
  data: GeneralInfo;
  isEditingModeEnabled: boolean;
  permissionsSettings?: ConfigurableProfilePermissions;
  onPermissionsSettingsChange: (event: CheckboxChangeEvent, settings: ChangedPermissionsSettings) => void;
  onProfileSettingsChange: (event: any, path: string) => void;
};

class EducationCard extends React.Component<Props> {
  private filterPermissions = ({ isEducationVisible }: Partial<ConfigurableProfilePermissions>) => ({
    isEducationVisible,
  })

  shouldComponentUpdate = (nextProps: Props) => (
    !isEqual(nextProps.data.educationHistory, this.props.data.educationHistory) ||
    !isEqual(nextProps.permissionsSettings?.isEducationVisible, this.props.permissionsSettings?.isEducationVisible) ||
    nextProps.isEditingModeEnabled !== this.props.isEditingModeEnabled
  )

  render() {
    const { isEditingModeEnabled, permissionsSettings, onPermissionsSettingsChange } = this.props;
    const { educationHistory } = this.props.data;
    return (
      <CommonCard
        title="Education"
        icon={<ReadOutlined />}
        content={educationHistory.length ?
          <List
            itemLayout="horizontal"
            dataSource={educationHistory}
            renderItem={(item: { university: string, faculty: string, graduationYear: string }) => (
              <List.Item>
                <Text strong>{item.graduationYear}</Text> {`${item.university} / ${item.faculty}`}
              </List.Item>
            )}
          /> : undefined
        }
        noDataDescrption="Education history isn't filled in"
        permissionsSettings={permissionsSettings ? this.filterPermissions(permissionsSettings) : undefined}
        isEditingModeEnabled={isEditingModeEnabled}
        onPermissionsSettingsChange={onPermissionsSettingsChange}
        profileSettingsContent={
          <>
            <List
              itemLayout="horizontal"
              dataSource={educationHistory}
              renderItem={({ university, faculty, graduationYear }:
                { university: string, faculty: string, graduationYear: string }) => (
                <List.Item>
                  <div style={{ width: '100%' }}>
                    <p style={{ marginBottom: 5 }}>
                      <Text strong>{graduationYear}</Text> {`${university} / ${faculty}`}
                    </p>
                    <p style={{ marginBottom: 10 }}>
                      <Button size="small" type="dashed"><DeleteOutlined/> Delete</Button>
                    </p>
                    <p style={{ fontSize: 18, marginBottom: 5 }}><Text strong>University:</Text></p>
                    <p style={{ fontSize: 18, marginBottom: 10 }}>
                      <Input value={university} style={{ width: '100%' }}/>
                    </p>
                    <p style={{ fontSize: 18, marginBottom: 5 }}><Text strong>Faculty</Text></p>
                    <p style={{ fontSize: 18, marginBottom: 10 }}>
                      <Input value={faculty} style={{ width: '100%' }}/>
                    </p>
                    <p style={{ fontSize: 18, marginBottom: 5 }}><Text strong>Graduation year:</Text></p>
                    <p style={{ fontSize: 18, marginBottom: 10 }}>
                      <Input value={graduationYear} style={{ width: '100%' }}/>
                    </p>
                  </div>
                </List.Item>
              )}
            />
            <Button type="dashed" style={{ width: '100%' }}><FileAddOutlined /> Add new university</Button>
          </>
        }
      />
    );
  };
}

export default EducationCard;
