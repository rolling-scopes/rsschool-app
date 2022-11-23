import { Dispatch, SetStateAction } from 'react';
import { ClockCircleOutlined, EditFilled, EditOutlined } from '@ant-design/icons';
import { Button, Col, notification, Row, Spin, Tag, Timeline, Typography } from 'antd';
import { SolutionReviewType, CrossCheckMessageAuthorRole } from 'services/course';
import { useSolutionReviewSettings } from 'modules/CrossCheck/hooks';
import { markdownLabel } from 'components/Forms/PreparedComment';
import { SolutionReview } from 'modules/CrossCheck/components/SolutionReview';
import { SolutionReviewSettingsPanel } from 'modules/CrossCheck/components/SolutionReviewSettingsPanel';

type Props = {
  sessionId: number;
  courseId: number;
  courseTaskId: number | null;
  state: { loading: boolean; data: SolutionReviewType[] };
  sessionGithubId: string;
  maxScore: number | undefined;
  setHistoricalCommentSelected: Dispatch<SetStateAction<string>>;
};

export function CrossCheckHistory(props: Props) {
  const courseTaskId = props.courseTaskId;
  const solutionReviewSettings = useSolutionReviewSettings();

  const handleClickAmendButton = (historicalComment: string) => {
    const commentWithoutMarkdownLabel = historicalComment.slice(markdownLabel.length);
    props.setHistoricalCommentSelected(commentWithoutMarkdownLabel);

    notification.success({ message: 'Pasted to comment field', duration: 2 });
  };

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
                <Col>
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
                  >
                    <Row style={{ marginTop: 16 }}>
                      <Col>
                        <Button
                          size="middle"
                          type={isActiveReview ? 'primary' : 'default'}
                          htmlType="button"
                          icon={isActiveReview ? <EditFilled /> : <EditOutlined />}
                          onClick={() => handleClickAmendButton(review.comment)}
                        >
                          Amend comment
                        </Button>
                      </Col>
                    </Row>
                  </SolutionReview>
                </Col>
              </Row>
            </Timeline.Item>
          );
        })}
      </Timeline>
    </Spin>
  );
}
