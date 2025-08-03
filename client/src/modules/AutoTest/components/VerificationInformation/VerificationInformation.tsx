import { Alert, Button, Col, Row, Space, theme, Tooltip, Typography } from 'antd';
import { VerificationsTable } from 'modules/AutoTest/components';
import { useAttemptsMessage } from 'modules/AutoTest/hooks';
import { CourseTaskVerifications } from 'modules/AutoTest/types';
import ReloadOutlined from '@ant-design/icons/ReloadOutlined';
import { CourseTaskDetailedDtoTypeEnum } from 'api';

export type VerificationInformationProps = {
  courseTask: CourseTaskVerifications;
  loading: boolean;
  isTableVisible: boolean;
  startTask: () => void;
  reload: () => void;
  showAnswers: () => void;
};

const { Text } = Typography;

function VerificationInformation({
  courseTask,
  loading,
  isTableVisible,
  startTask,
  reload,
  showAnswers,
}: VerificationInformationProps): any {
  const { maxScore, verifications } = courseTask;
  const { explanation, attemptsLeftMessage, allowStartTask, allowCheckAnswers } = useAttemptsMessage(courseTask);

  const isSelfEducationTask = courseTask.type === CourseTaskDetailedDtoTypeEnum.Selfeducation;

  const { token } = theme.useToken();

  return (
    <>
      <Row
        style={{
          background: token.colorBgContainer,
          padding: '24px 24px 12px',
        }}
        gutter={[0, 24]}
        justify="end"
      >
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
            <Space wrap style={{ justifyContent: 'end' }}>
              <Button type="primary" onClick={startTask} disabled={!allowStartTask}>
                Start task
              </Button>
              <Button icon={<ReloadOutlined />} onClick={reload}>
                Refresh
              </Button>
              {isSelfEducationTask && (
                <Tooltip
                  placement="topRight"
                  title={allowCheckAnswers ? '' : 'Will be available after the deadline and at least 1 attempt'}
                >
                  <Button disabled={!allowCheckAnswers} onClick={showAnswers}>
                    Show answers
                  </Button>
                </Tooltip>
              )}
            </Space>
          </Col>
        )}
      </Row>
      {isTableVisible && (
        <Row
          style={{
            background: token.colorBgContainer,
            padding: '0 24px 24px',
          }}
          gutter={[0, 24]}
          justify="center"
        >
          <Col span={24}>
            <VerificationsTable maxScore={maxScore} verifications={verifications} loading={loading} />
          </Col>
        </Row>
      )}
    </>
  );
}

export default VerificationInformation;
