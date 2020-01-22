import * as React from 'react';
import { GeneralInfo } from '../../../../common/models/profile';
import {
  Typography,
} from 'antd';
import CommonCard from './CommonCard';

const { Text } = Typography;

import { TagOutlined } from '@ant-design/icons';

type Props = {
  data: GeneralInfo;
  isEditingModeEnabled: boolean;
};

class EnglishCard extends React.Component<Props> {
  render() {
    const { englishLevel } = this.props.data;
    return (
      <CommonCard
        title="Estimated English level"
        icon={<TagOutlined />}
        content={<Text style={{ textTransform: 'capitalize', fontSize: '48px' }}>{englishLevel}</Text>}
      />
    );
  }
}

export default EnglishCard;
