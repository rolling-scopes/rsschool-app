import { Row, Col, Space, Button, Alert, Typography } from 'antd';
import { VerificationsTable } from 'modules/AutoTest/components';
import { useAttemptsMessage } from 'modules/AutoTest/hooks';
import { CourseTaskVerifications } from 'modules/AutoTest/types';
import { ReloadOutlined } from '@ant-design/icons';
import { CourseTaskDetailedDtoTypeEnum } from 'api';

export type VerificationInformationProps = {
  courseTask: CourseTaskVerifications;
  loading: boolean;
  isTableVisible: boolean;
  startTask: () => void;
  reload: () => void;
};

const { Text } = Typography;

function VerificationInformation({
  courseTask,
  loading,
  isTableVisible,
  startTask,
  reload,
}: VerificationInformationProps): any {
  const { maxScore, verifications } = courseTask;
  const { explanation, attemptsLeftMessage, allowStartTask, allowCheckAnswers } = useAttemptsMessage(courseTask);

  const isSelfEducationTask = courseTask.type === CourseTaskDetailedDtoTypeEnum.Selfeducation;

  return (
    <>
      <Row style={{ background: 'white', padding: '24px 24px 12px' }} gutter={[0, 24]} justify="end">
        <Col span={24}>
          <Alert showIcon type="info" message={explanation} />
        </Col>
        {attemptsLeftMessage && (
          <Col flex="auto">
            <Space>
              <Text type="secondary">Attempts:</Text>
              <Text>{attemptsLeftMessage}</Text>
            </Space>
          </Col>
        )}
        {isTableVisible && (
          <Col flex="none">
            <Button icon={<ReloadOutlined />} onClick={reload}>
              Refresh
            </Button>
          </Col>
        )}
      </Row>
      {isTableVisible && (
        <Row style={{ background: 'white', padding: '0 24px 24px' }} gutter={[0, 24]} justify="center">
          <Col span={24}>
            <VerificationsTable maxScore={maxScore} verifications={verifications} loading={loading} />
          </Col>
          <Col>
            <Button type="primary" onClick={startTask} disabled={!allowStartTask}>
              Start test
            </Button>
          </Col>
          {isSelfEducationTask && (
            <Col>
              <Button disabled={!allowCheckAnswers}>Show answers</Button>
            </Col>
          )}
        </Row>
      )}
    </>
  );
}

export default VerificationInformation;
