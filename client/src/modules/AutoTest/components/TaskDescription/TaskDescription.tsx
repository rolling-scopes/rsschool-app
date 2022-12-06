import React from 'react';
import { Row, Col, Space, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { getAutoTestRoute } from 'services/routes';

const { Title, Text, Link } = Typography;

type TaskDescriptionProps = {
  courseAlias: string;
  name: string;
  descriptionUrl: string;
};

function TaskDescription({ courseAlias, name, descriptionUrl }: TaskDescriptionProps) {
  return (
    <Row style={{ background: 'white', margin: '-15px -16px 24px', padding: '16px 24px' }}>
      <Col span={24}>
        <Title level={3}>
          <Space size={24}>
            <Link href={getAutoTestRoute(courseAlias)}>
              <ArrowLeftOutlined />
            </Link>
            {name}
          </Space>
        </Title>
      </Col>
      <Col span={24}>
        <Space>
          <Text type="secondary">Description: </Text>
          <Link href={descriptionUrl} target="_blank">
            {descriptionUrl}
          </Link>
        </Space>
      </Col>
    </Row>
  );
}

export default TaskDescription;
