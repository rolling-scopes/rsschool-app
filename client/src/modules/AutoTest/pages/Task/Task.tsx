import React, { useContext, useMemo, useState } from 'react';
import { CoursePageProps } from 'services/models';
import { CourseTaskDetailedDto } from 'api';
import { Row, Col, Typography, Space, Button, Alert, Table, message } from 'antd';
import { PageLayout } from 'components/PageLayout';
import { SessionContext } from 'modules/Course/contexts';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useAsync } from 'react-use';
import { CourseService, Verification } from 'services/course';
import { ColumnType } from 'antd/lib/table';
import { getAutoTestRoute } from 'services/routes';

export interface AutoTestTaskProps extends CoursePageProps {
  task: CourseTaskDetailedDto;
}

const { Title, Text, Link } = Typography;

function getColumns(): ColumnType<Verification>[] {
  return [
    {
      key: 'date-time',
      title: 'Date / Time',
      dataIndex: 'createdDate',
    },
    {
      key: 'score',
      title: 'Score / Max',
      dataIndex: 'score',
    },
    {
      key: 'accuracy',
      title: 'Accuracy',
      dataIndex: 'id',
    },
    {
      key: 'details',
      title: 'Details',
      dataIndex: 'details',
    },
  ];
}

function Task({ course, task }: AutoTestTaskProps) {
  const { githubId } = useContext(SessionContext);
  const courseService = useMemo(() => new CourseService(course.id), []);

  const maxAttempts = 2;
  const attempts = 0;

  const [verifications, setVerifications] = useState<Verification[]>([]);

  useAsync(async () => {
    try {
      const verifications = await courseService.getTaskVerifications();
      setVerifications(verifications);
    } catch (error) {
      message.error(error);
    }
  }, []);

  return (
    <PageLayout loading={false} title="Auto-tests" background="#F0F2F5" githubId={githubId} courseName={course.name}>
      <Row style={{ background: 'white', margin: '-15px -16px 24px', padding: '16px 24px' }}>
        <Col span={24}>
          <Title level={3}>
            <Space size={24}>
              <Link href={getAutoTestRoute(course.alias)}>
                <ArrowLeftOutlined />
              </Link>
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
            message={`You must score at least 70% of points to pass. You have only ${maxAttempts} attempts.`}
          />
        </Col>
        <Col span={24}>
          <Space>
            <Text type="secondary">Attempts:</Text>
            <Text>{`${attempts} attempts left`}</Text>
          </Space>
        </Col>
        <Col span={24}>
          <Table
            locale={{
              // disable default tooltips on sortable columns
              triggerDesc: undefined,
              triggerAsc: undefined,
              cancelSort: undefined,
            }}
            pagination={false}
            columns={getColumns()}
            dataSource={verifications}
            size="middle"
            rowKey="id"
            loading={false}
          />
        </Col>
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
