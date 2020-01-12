import * as React from 'react';
import {
  Card,
  Typography,
} from 'antd';

const { Title } = Typography;

type Props = {
  title: string;
  icon: any;
  content: any;
  actions?: any;
};

class CommonCard extends React.Component<Props> {
  render() {
    const { title, icon, content, actions } = this.props;
    return (
      <Card
        title={
          <Title
            level={2}
            ellipsis={true}
            style={{ fontSize: 16, marginBottom: 0 }}
          >
            {icon} {title}
          </Title>
        }
        actions={actions ? actions : []}
      >
        {content}
      </Card>
    );
  }
}

export default CommonCard;
