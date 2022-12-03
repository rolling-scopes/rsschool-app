import { Button, Card, Col, Divider, Row, Typography } from 'antd';
import React from 'react';
import { CourseTaskDto } from 'api';
import { TestDeadlineDate } from '..';
import TestCardColumn from '../TestCardColumn/TestCardColumn';

const { Title, Text } = Typography;

function TestCard({ name, studentStartDate, studentEndDate }: CourseTaskDto) {
  return (
    <Card
      title={
        <Title level={5} ellipsis={true}>
          {name}
        </Title>
      }
      extra={<TestDeadlineDate startDate={studentStartDate} endDate={studentEndDate} />}
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
          <TestCardColumn label="Status" value="Uncompleted" isTag={true} />
        </Col>
        <Col span={8}>
          <TestCardColumn label="Attempts" value="2 attempts left" />
        </Col>
        <Col span={8}>
          <TestCardColumn label="Score" value="-" />
        </Col>
      </Row>
    </Card>
  );
}

export default TestCard;
