import React, { useContext } from 'react';
import { CoursePageProps } from 'services/models';
import { CourseTaskDetailedDto } from 'api';
import { Row, Col, Typography, Space, Button, Alert } from 'antd';
import { PageLayout } from 'components/PageLayout';
import { SessionContext } from 'modules/Course/contexts';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';

export interface AutoTestTaskProps extends CoursePageProps {
  task: CourseTaskDetailedDto;
}

const { Title, Text, Link } = Typography;

function Task({ course, task }: AutoTestTaskProps) {
  const { githubId } = useContext(SessionContext);
  const router = useRouter();
  const attempts = 0;

  return (
    <PageLayout loading={false} title="Auto-tests" background="#F0F2F5" githubId={githubId} courseName={course.name}>
      <Row style={{ background: 'white', margin: '-15px -16px 24px', padding: 24 }}>
        <Col span={24}>
          <Title level={3}>
            <Space>
              <Button type="link" onClick={() => router.back()}>
                <ArrowLeftOutlined />
              </Button>
              {task.name}
            </Space>
          </Title>
        </Col>
        <Col span={24}>
          <Space>
            <Text type="secondary">Description: </Text>
            <Link href={task.descriptionUrl}>{task.descriptionUrl}</Link>
          </Space>
        </Col>
      </Row>
      <Row style={{ background: 'white', padding: 24 }} gutter={[0, 24]} justify="center">
        <Col span={24}>
          <Alert
            showIcon
            type="info"
            message="You must score at least 70% of points to pass. You have only 2 attempts."
          />
        </Col>
        <Col span={24}>
          <Space>
            <Text type="secondary">Attempts:</Text>
            <Text>{`${attempts} attempts left`}</Text>
          </Space>
        </Col>
        <Col span={24}>Table</Col>
        <Col>
          <Space>
            <Button type="primary">Start test</Button>
            <Button>Answers</Button>
          </Space>
        </Col>
      </Row>
    </PageLayout>
  );
}

export default Task;
