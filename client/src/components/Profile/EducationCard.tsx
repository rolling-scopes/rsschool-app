import * as React from 'react';
import { GeneralInfo } from '../../../../common/models/profile';
import {
  Typography,
  List,
} from 'antd';
import CommonCard from './CommonCard';

const { Text } = Typography;

import { ReadOutlined } from '@ant-design/icons';

type Props = {
  data: GeneralInfo;
  isEditingModeEnabled: boolean;
};

class EducationCard extends React.Component<Props> {
  render() {
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
      />
    );
  };
}

export default EducationCard;
