import { Row, Col, Space, Button, Alert, Typography } from 'antd';
import { VerificationsTable } from 'modules/AutoTest/components';
import { useAttemptsMessage } from 'modules/AutoTest/hooks';
import { CourseTaskVerifications } from 'modules/AutoTest/types';

type VerificationInformationProps = {
  courseTask: CourseTaskVerifications;
  loading: boolean;
  isTableVisible: boolean;
  startTask: () => void;
};

const { Text } = Typography;

function VerificationInformation({
  courseTask,
  loading,
  isTableVisible,
  startTask,
}: VerificationInformationProps): any {
  const { maxScore, verifications } = courseTask;
  const { explanation, attemptsLeftMessage, allowStartTask } = useAttemptsMessage(courseTask);

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
      {isTableVisible && (
        <>
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
        </>
      )}
    </Row>
  );
}

export default VerificationInformation;
