import { Button, Card, Col, Divider, Row, Space, Tag, Typography } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import React from 'react';
import moment from 'moment';

const { Title, Text } = Typography;

function TestCard() {
  return (
    <Card
      title={
        <Title level={5} ellipsis={true}>
          Test name
        </Title>
      }
      extra={
        <Space wrap style={{ justifyContent: 'end' }}>
          <Text type="secondary">
            <CalendarOutlined />
          </Text>
          <Text type="secondary">
            {moment().format('MMM DD')} &ndash; {moment().add(7, 'd').format('MMM DD')}
          </Text>
        </Space>
      }
    >
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Text>
            You can submit your solution as many times as you need before the deadline. Without fines. After the
            deadline, the submission will be closed.. Read more
          </Text>
        </Col>
        <Col span={24}>
          <Button type="primary">View details</Button>
        </Col>
      </Row>
      <Divider />
      <Row gutter={16}>
        <Col span={8}>
          <Space direction="vertical">
            <Text>Status</Text>
            <Tag>Uncompleted</Tag>
          </Space>
        </Col>
        <Col span={8}>
          <Space direction="vertical">
            <Text type="secondary">Attempts</Text>
            <Text>2 attempts left</Text>
          </Space>
        </Col>
        <Col span={8}>
          <Space direction="vertical">
            <Text type="secondary">Score</Text>
            <Text>&mdash;</Text>
          </Space>
        </Col>
      </Row>
    </Card>
  );
}

export default TestCard;
