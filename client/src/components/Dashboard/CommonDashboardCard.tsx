import * as React from 'react';
import { Card, Typography, Empty } from 'antd';

import { FullscreenOutlined } from '@ant-design/icons';

const { Title } = Typography;

type Props = {
  isMoreContent?: boolean | undefined;
  noDataDescription?: string | undefined;
  title: string;
  icon: any;
  content: any;
};

type State = {
  isVisibilitySettingsVisible: boolean;
  isProfileSettingsVisible: boolean;
};
class CommonCard extends React.Component<Props, State> {
  state = {
    isVisibilitySettingsVisible: false,
    isProfileSettingsVisible: false,
  };

  render() {
    const { title, icon, content, isMoreContent, noDataDescription } = this.props;

    return (
      <Card
        title={
          <Title level={2} ellipsis={true} style={{ fontSize: 16, marginBottom: 0 }}>
            {icon} {title}
          </Title>
        }
        actions={
          isMoreContent
            ? [<FullscreenOutlined key="main-card-actions-more" onClick={e => console.log(e)} />].filter(Boolean)
            : []
        }
      >
        {content ? content : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={noDataDescription} />}
      </Card>
    );
  }
}

export default CommonCard;
