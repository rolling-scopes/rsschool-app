import { ClockCircleOutlined } from '@ant-design/icons';
import { Col, Row, Spin, Tag, Timeline, Typography } from 'antd';
import { SolutionReviewType, CrossCheckMessageAuthorRole } from 'services/course';
import { useSolutionReviewSettings } from 'modules/CrossCheck/hooks';
import { SolutionReview } from 'modules/CrossCheck/components/SolutionReview';
import { SolutionReviewSettingsPanel } from 'modules/CrossCheck/components/SolutionReviewSettingsPanel';

type CrossCheckHistoryState = {
  loading: boolean;
  data: SolutionReviewType[];
};

type Props = {
  sessionId: number;
  courseId: number;
  courseTaskId: number | null;
  state: CrossCheckHistoryState;
  sessionGithubId: string;
  maxScore: number | undefined;
};

export function CrossCheckHistory(props: Props) {
  const courseTaskId = props.courseTaskId;
  const solutionReviewSettings = useSolutionReviewSettings();

  return (
    <Spin spinning={props.state.loading}>
      <Typography.Title style={{ marginTop: 24 }} level={4}>
        History
      </Typography.Title>

      {props.state.data.length > 0 && (
        <Row style={{ marginBottom: '16px' }}>
          <Col>
            <SolutionReviewSettingsPanel settings={solutionReviewSettings} />
          </Col>
        </Row>
      )}

      <Timeline>
        {props.state.data.map((review, index) => {
          const isActiveReview = index === 0;

          return (
            <Timeline.Item
              key={index}
              color={isActiveReview ? 'green' : 'gray'}
              dot={<ClockCircleOutlined style={{ fontSize: '16px' }} />}
            >
              <Row>
                <Col>{isActiveReview ? <Tag color="success">active review</Tag> : <Tag>outdated review</Tag>}</Col>

                {review.author && (
                  <Col>
                    <Tag color={isActiveReview ? 'warning' : ''}>your name is visible</Tag>
                  </Col>
                )}
              </Row>

              <Row>
                <Col span={24}>
                  <SolutionReview
                    sessionId={props.sessionId}
                    sessionGithubId={props.sessionGithubId}
                    courseId={props.courseId}
                    reviewNumber={0}
                    settings={solutionReviewSettings}
                    courseTaskId={courseTaskId}
                    review={review}
                    isActiveReview={isActiveReview}
                    isMessageSendingPanelVisible={isActiveReview}
                    currentRole={CrossCheckMessageAuthorRole.Reviewer}
                    maxScore={props.maxScore}
                  />
                </Col>
              </Row>
            </Timeline.Item>
          );
        })}
      </Timeline>
    </Spin>
  );
}
