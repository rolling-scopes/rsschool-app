import { Col, Card, Button, Alert, Typography, Flex } from 'antd';
import { CommentOutlined, InfoCircleTwoTone } from '@ant-design/icons';
import { InterviewDto } from 'api';
import {
  getInterviewCardResult,
  InterviewDetails,
  InterviewPeriod,
  InterviewStatus,
  isRegistrationNotStarted,
} from 'domain/interview';
import { InterviewDescription } from './InterviewDescription';
import { getInterviewCardDetails } from '../data/getInterviewCardDetails';
import { AlertDescription } from './AlertDescription';
import { ExtraInfo } from './ExtraInfo';
import { Decision } from 'data/interviews/technical-screening';

const { Meta } = Card;

export const InterviewCard = ({
  comment,
  interview,
  item,
  isRegistered,
  onRegister,
}: {
  comment?: string | null;
  interview: InterviewDto;
  item: InterviewDetails | null;
  isRegistered: boolean;
  onRegister: (id: string) => void;
}) => {
  const { id, descriptionUrl, name, startDate, endDate, studentRegistrationStartDate: registrationStart } = interview;
  const interviewPassed = item?.status === InterviewStatus.Completed;
  const interviewResult = getInterviewCardResult(item?.result as Decision);
  const hasInterviewPair = !!item;

  const registrationNotStarted = isRegistrationNotStarted(registrationStart);
  const { cardMessage, backgroundImage } = getInterviewCardDetails({
    interviewResult,
    interviewPassed,
    isRegistered,
    registrationNotStarted,
    registrationStart,
    hasInterviewPair,
  });

  return (
    <Col key={id} xs={24} lg={12}>
      <Card
        bodyStyle={{ paddingTop: 0 }}
        hoverable
        title={
          <Button type="link" href={descriptionUrl} target="_blank" style={{ padding: 0, fontWeight: 500 }}>
            {name}
          </Button>
        }
        extra={<InterviewPeriod startDate={startDate} endDate={endDate} shortDate />}
      >
        <Meta
          style={{ minHeight: 80, alignItems: 'center', textAlign: 'center' }}
          description={
            item ? (
              <InterviewDescription {...item} />
            ) : (
              <ExtraInfo
                id={id}
                registrationStart={registrationStart}
                isRegistered={isRegistered}
                onRegister={onRegister}
              />
            )
          }
        />
        <Flex vertical gap="small">
          <Alert
            message={<div style={{ minHeight: 50 }}>{cardMessage}</div>}
            icon={<InfoCircleTwoTone />}
            showIcon
            type="info"
            description={<AlertDescription backgroundImage={backgroundImage} />}
            style={{ minHeight: 275 }}
          />
          {comment && (
            <Alert
              message={
                <Typography.Paragraph ellipsis={{ rows: 1, tooltip: true }} style={{ marginBottom: 0 }}>
                  {comment}
                </Typography.Paragraph>
              }
              icon={<CommentOutlined />}
              showIcon
              type="success"
            />
          )}
        </Flex>
      </Card>
    </Col>
  );
};
