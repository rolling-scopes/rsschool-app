import React from 'react';
import { Row, Col, Space, Button, Alert, Typography } from 'antd';
import { Verification } from 'services/course';
import { VerificationsTable } from 'modules/AutoTest/components';
import { CourseTaskDetailedDto } from 'api';
import { useAttemptsMessage } from '../../hooks/useAttemptsMessage';

type VerificationInformationProps = {
  courseTask: CourseTaskDetailedDto;
  verifications: Verification[];
  loading: boolean;
  startTask: () => void;
};

const { Text } = Typography;

function VerificationInformation({ courseTask, verifications, loading, startTask }: VerificationInformationProps): any {
  const { maxScore } = courseTask;
  const { explanation, attemptsLeftMessage, allowStartTask } = useAttemptsMessage(courseTask, verifications);

  return (
    <Row style={{ background: 'white', padding: 24 }} gutter={[0, 24]} justify="center">
      <Col span={24}>
        <Alert showIcon type="info" message={explanation} />
      </Col>
      {attemptsLeftMessage && (
        <Col span={24}>
          <Space>
            <Text type="secondary">Attempts:</Text>
            <Text>{attemptsLeftMessage}</Text>
          </Space>
        </Col>
      )}
      <Col span={24}>
        <VerificationsTable maxScore={maxScore} verifications={verifications} loading={loading} />
      </Col>
      <Col>
        <Space>
          <Button type="primary" onClick={startTask} disabled={!allowStartTask}>
            Start test
          </Button>
        </Space>
      </Col>
    </Row>
  );
}

export default VerificationInformation;
