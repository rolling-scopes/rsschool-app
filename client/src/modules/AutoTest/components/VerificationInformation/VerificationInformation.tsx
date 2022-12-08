import React, { useMemo } from 'react';
import { Row, Col, Space, Button, Alert, Typography } from 'antd';
import { SelfEducationPublicAttributes, Verification } from 'services/course';
import { VerificationsTable } from 'modules/AutoTest/components';
import { getAttemptsLeftMessage } from 'modules/AutoTest/utils/getAttemptsLeftMessage';
import { CourseTaskDetailedDto } from '../../../../api';

type VerificationInformationProps = {
  courseTask: CourseTaskDetailedDto;
  verifications: Verification[];
  loading: boolean;
  startTask: () => void;
};

const { Text } = Typography;

export function VerificationInformation({
  courseTask,
  verifications,
  loading,
  startTask,
}: VerificationInformationProps): any {
  const { publicAttributes, maxScore } = courseTask;
  const { maxAttemptsNumber, tresholdPercentage, strictAttemptsMode } =
    (publicAttributes as SelfEducationPublicAttributes) || {};
  const attempts = useMemo(() => maxAttemptsNumber - verifications?.length ?? 0, [verifications?.length]);

  return (
    <Row style={{ background: 'white', padding: 24 }} gutter={[0, 24]} justify="center">
      <Col span={24}>
        <Alert
          showIcon
          type="info"
          message={
            <>
              <Text>
                You must score at least {tresholdPercentage}% of points to pass. You have only {maxAttemptsNumber}{' '}
                attempts.
              </Text>{' '}
              {!strictAttemptsMode && (
                <Text strong>After limit attempts is over you can get only half of a score.</Text>
              )}
            </>
          }
        />
      </Col>
      <Col span={24}>
        <Space>
          <Text type="secondary">Attempts:</Text>
          <Text>{getAttemptsLeftMessage(attempts, strictAttemptsMode)}</Text>
        </Space>
      </Col>
      <Col span={24}>
        <VerificationsTable maxScore={maxScore} verifications={verifications} loading={loading} />
      </Col>
      <Col>
        <Space>
          <Button type="primary" onClick={startTask}>
            Start test
          </Button>
          <Button>Answers</Button>
        </Space>
      </Col>
    </Row>
  );
}
