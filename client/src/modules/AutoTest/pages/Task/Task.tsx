import React, { useContext, useMemo, useState } from 'react';
import { CoursePageProps } from 'services/models';
import { CourseTaskDetailedDto } from 'api';
import { Row, Col, Typography, Space, Button, Alert, message } from 'antd';
import { PageLayout } from 'components/PageLayout';
import { SessionContext } from 'modules/Course/contexts';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useAsync } from 'react-use';
import { CourseService, SelfEducationPublicAttributes, Verification } from 'services/course';
import { getAutoTestRoute } from 'services/routes';
import { useLoading } from 'components/useLoading';
import { VerificationsTable } from 'modules/AutoTest/components';

export interface AutoTestTaskProps extends CoursePageProps {
  task: CourseTaskDetailedDto;
}

const { Title, Text, Link } = Typography;

function Task({ course, task }: AutoTestTaskProps) {
  const { name, publicAttributes, descriptionUrl, maxScore } = task;
  const { maxAttemptsNumber, tresholdPercentage } = (publicAttributes as SelfEducationPublicAttributes) || {};

  const { githubId } = useContext(SessionContext);
  const [loading, withLoading] = useLoading(false);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const courseService = useMemo(() => new CourseService(course.id), []);
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
              {name}
            </Space>
          </Title>
        </Col>
        <Col span={24}>
          <Space>
            <Text type="secondary">Description: </Text>
            <Link href={descriptionUrl}>{descriptionUrl}</Link>
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
          <VerificationsTable maxScore={maxScore} verifications={verifications} loading={loading} />
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
