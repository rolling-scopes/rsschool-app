import * as React from 'react';
import { GeneralInfo } from '../../../../common/models/profile';
import {
  Typography,
} from 'antd';
import CommonCard from './CommonCard';

const { Paragraph } = Typography;

import { InfoCircleOutlined } from '@ant-design/icons';

type Props = {
  data: GeneralInfo;
};

class AboutCard extends React.Component<Props> {
  render() {
    const { aboutMyself } = this.props.data;
    return (
      <CommonCard
        title="About"
        icon={<InfoCircleOutlined />}
        content={<Paragraph ellipsis={{ rows: 2, expandable: true }}>{aboutMyself}</Paragraph>}
      />
    );
  }
}

export default AboutCard;
