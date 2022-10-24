import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ClockCircleOutlined, EditFilled, EditOutlined } from '@ant-design/icons';
import { Button, Col, notification, Row, Spin, Tag, Timeline, Typography } from 'antd';
import { CourseService, SolutionReviewType, TaskSolutionResultRole } from 'services/course';
import { useSolutionReviewSettings } from './hooks/useSolutionReviewSettings';
import { markdownLabel } from 'components/Forms/PreparedComment';
import { SolutionReview } from './SolutionReview';
import { SolutionReviewSettingsPanel } from './SolutionReviewSettingsPanel';

type Props = {
  sessionGithubId: string;
  courseId: number;
  githubId: string | null;
  courseTaskId: number | null;
  maxScore: number | undefined;
  setHistoricalCommentSelected: Dispatch<SetStateAction<string>>;
};

export function CrossCheckHistory(props: Props) {
  if (props.githubId == null || props.courseTaskId == null) {
    return null;
  }
  const githubId = props.githubId;
  const courseTaskId = props.courseTaskId;
  const solutionReviewSettings = useSolutionReviewSettings();

  const [state, setState] = useState({ loading: false, data: [] as SolutionReviewType[] });

  const loadStudentScoreHistory = async (githubId: string) => {
    const courseService = new CourseService(props.courseId);
    setState({ loading: true, data: [] });
    const result = await courseService.getTaskSolutionResult(githubId, courseTaskId);

    if (!result) {
      return setState({ loading: false, data: [] });
    }

    const sortedData = result.historicalScores.sort((a, b) => b.dateTime - a.dateTime);

    const messages = result.anonymous
      ? result.messages.map(message => ({
          ...message,
          author: message.role === TaskSolutionResultRole.Checker ? null : message.author,
        }))
      : result.messages;

    const solutionReviews = sortedData.map(({ dateTime, comment, score, anonymous }, index) => ({
      dateTime,
      comment,
      score,
      id: result.id,
      author: !anonymous ? result.author : null,
      messages: index === 0 ? messages : [],
    }));

    setState({ loading: false, data: solutionReviews });
  };

  useEffect(() => {
    loadStudentScoreHistory(githubId);
  }, [githubId]);

  const handleClickAmendButton = (historicalComment: string) => {
    const commentWithoutMarkdownLabel = historicalComment.slice(markdownLabel.length);
    props.setHistoricalCommentSelected(commentWithoutMarkdownLabel);

    notification.success({ message: 'Pasted to comment field', duration: 2 });
  };

  return (
    <Spin spinning={state.loading}>
      <Typography.Title style={{ marginTop: 24 }} level={4}>
        History
      </Typography.Title>

      {state.data.length > 0 && (
        <Row style={{ marginBottom: '16px' }}>
          <Col>
            <SolutionReviewSettingsPanel settings={solutionReviewSettings} />
          </Col>
        </Row>
      )}

      <Timeline>
        {state.data.map((review, index) => {
          const isActiveReview = index === 0;

          return (
            <Timeline.Item
              key={index}
              color={isActiveReview ? 'green' : 'gray'}
              dot={<ClockCircleOutlined style={{ fontSize: '16px' }} />}
            >
              <Row>
                <Col>{isActiveReview ? <Tag color="success">active review</Tag> : <Tag>Outdated review</Tag>}</Col>

                {review.author && (
                  <Col>
                    <Tag color={isActiveReview ? 'warning' : ''}>your name is visible</Tag>
                  </Col>
                )}
              </Row>

              <Row>
                <SolutionReview
                  sessionGithubId={props.sessionGithubId}
                  courseId={props.courseId}
                  reviewNumber={0}
                  settings={solutionReviewSettings}
                  courseTaskId={courseTaskId}
                  review={review}
                  isActiveReview={isActiveReview}
                  areMessagesVisible={isActiveReview}
                  role={TaskSolutionResultRole.Checker}
                  maxScore={props.maxScore}
                >
                  <Row>
                    <Col>
                      <Button
                        size="middle"
                        type={isActiveReview ? 'primary' : 'default'}
                        htmlType="button"
                        icon={isActiveReview ? <EditFilled /> : <EditOutlined />}
                        onClick={() => handleClickAmendButton(review.comment)}
                      >
                        Amend review
                      </Button>
                    </Col>
                  </Row>
                </SolutionReview>
              </Row>
            </Timeline.Item>
          );
        })}
      </Timeline>
    </Spin>
  );
}
