import React, { useContext, useMemo, useState } from 'react';
import { CoursePageProps } from 'services/models';
import { CourseTaskDetailedDto } from 'api';
import { Row, Col, Typography, Space, Button, Alert, Table, message } from 'antd';
import { PageLayout } from 'components/PageLayout';
import { SessionContext } from 'modules/Course/contexts';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useAsync } from 'react-use';
import { CourseService, SelfEducationPublicAttributes, Verification } from 'services/course';
import { ColumnType } from 'antd/lib/table';
import { getAutoTestRoute } from 'services/routes';
import { useLoading } from 'components/useLoading';
import { dateWithTimeZoneRenderer } from 'components/Table';

export interface AutoTestTaskProps extends CoursePageProps {
  task: CourseTaskDetailedDto;
}

const { Title, Text, Link } = Typography;

function getColumns(maxScore: number): ColumnType<Verification>[] {
  return [
    {
      key: 'date-time',
      title: 'Date / Time',
      dataIndex: 'createdDate',
      render: createdDate => {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return dateWithTimeZoneRenderer(timezone, 'YYYY-MM-DD HH:mm')(createdDate);
      },
    },
    {
      key: 'score',
      title: 'Score / Max',
      dataIndex: 'score',
      render: score => {
        return (
          <Text>
            {score ?? 0} / {maxScore}
          </Text>
        );
      },
    },
    {
      key: 'accuracy',
      title: 'Accuracy',
      render: (_, row: Verification) => {
        const accuracyWordWithNumber = /accuracy:\s+(\d+%)/gi;
        const [, accuracyNumber] = accuracyWordWithNumber.exec(row.details) ?? [];
        return accuracyNumber ?? 'N/A';
      },
    },
    {
      key: 'details',
      title: 'Details',
      dataIndex: 'details',
    },
  ];
}

function Task({ course, task }: AutoTestTaskProps) {
  const { maxAttemptsNumber, tresholdPercentage } = (task.publicAttributes as SelfEducationPublicAttributes) || {};

  const { githubId } = useContext(SessionContext);
  const courseService = useMemo(() => new CourseService(course.id), []);
  const [loading, withLoading] = useLoading(false);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const attempts = useMemo(() => maxAttemptsNumber - verifications?.length ?? 0, [verifications?.length]);

  useAsync(
    withLoading(async () => {
      try {
        const verifications = await courseService.getTaskVerifications();
        setVerifications(verifications);
      } catch (error) {
        message.error(error);
      }
    }),
    [],
  );

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
            message={`You must score at least ${tresholdPercentage}% of points to pass. You have only ${maxAttemptsNumber} attempts.`}
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
            columns={getColumns(task.maxScore)}
            dataSource={verifications}
            size="middle"
            rowKey="id"
            loading={loading}
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
