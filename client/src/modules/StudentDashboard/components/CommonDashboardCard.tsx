
import * as React from 'react';
import { Card, Typography, Empty, CardProps } from 'antd';

import { FullscreenOutlined } from '@ant-design/icons';

const { Title } = Typography;

type Props = Omit<CardProps, 'content'> & {
  isMoreContent?: boolean | undefined;
  noDataDescription?: string | undefined;
  content?: React.ReactNode;
};

type State = {
  isVisibilitySettingsVisible: boolean;
  isProfileSettingsVisible: boolean;
};
const CommonCard = (props: Props) => {


    const [isVisibilitySettingsVisible, setIsVisibilitySettingsVisible] = useState(false);
    const [isProfileSettingsVisible, setIsProfileSettingsVisible] = useState(false);

    

    const { title, content, isMoreContent, noDataDescription, ...restProps } = props;

    return (
      <Card
        title={
          <Title level={2} ellipsis={true} style={{ fontSize: 16, marginBottom: 0 }}>
            {title}
          </Title>
        }
        actions={isMoreContent ? [<FullscreenOutlined key="main-card-actions-more" />].filter(Boolean) : []}
        {...restProps}
      >
        {content ? content : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={noDataDescription} />}
      </Card>
    ); 
};




export default CommonCard;
