import * as React from 'react';
import { GeneralInfo } from '../../../../common/models/profile';
import { GithubAvatar } from 'components';
import {
  Card,
  Typography,
} from 'antd';

const { Title, Paragraph } = Typography;

import {
  GithubFilled,
  EnvironmentFilled,
} from '@ant-design/icons';

type Props = {
  data: GeneralInfo;
};

class MainCard extends React.Component<Props> {
  render() {
    const { githubId, name, locationName } = this.props.data;
    return (
      <Card>
        <GithubAvatar size={96} githubId={githubId} style={{ margin: '0 auto 10px', display: 'block' }} />
        <Title level={1} style={{ fontSize: 24, textAlign: 'center', margin: 0 }}>{name}</Title>
        <Paragraph style={{ textAlign: 'center', marginBottom: 20 }}>
          <a target="_blank" href={`https://github.com/${githubId}`} style={{ marginLeft: '-14px', fontSize: 16 }}>
            <GithubFilled /> {githubId}
          </a>
        </Paragraph>
        <Paragraph style={{ textAlign: 'center', margin: 0 }}>
          <span style={{ marginLeft: '-14px' }}>
            <EnvironmentFilled /> {locationName}
          </span>
        </Paragraph>
      </Card>
    );
  }
}

export default MainCard;
