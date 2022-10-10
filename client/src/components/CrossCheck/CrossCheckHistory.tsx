import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ClockCircleOutlined, EditFilled, EditOutlined } from '@ant-design/icons';
import { Button, Col, notification, Row, Spin, Tag, Timeline, Typography } from 'antd';
import { CourseService, SolutionReviewType } from 'services/course';
import { markdownLabel } from 'components/Forms/PreparedComment';
import { SolutionReview } from './SolutionReview';

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

  const [state, setState] = useState({ loading: false, data: [] as SolutionReviewType[] });

  const loadStudentScoreHistory = async (githubId: string) => {
    const courseService = new CourseService(props.courseId);
    setState({ loading: true, data: [] });
    const result = await courseService.getTaskSolutionResult(githubId, courseTaskId);
    const sortedData = result?.historicalScores.sort((a, b) => b.dateTime - a.dateTime) ?? [];

    const solutionReviews = sortedData.map(({ dateTime, comment, score, anonymous }) => ({
      checkDate: new Date(dateTime).toISOString(),
      comment,
      checker: !anonymous ? result?.checker ?? null : null,
      score,
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
      <Timeline>
        {state.data.map((review, index) => {
          const isCurrentReview = index === 0;

          return (
            <Timeline.Item
              key={index}
              color={isCurrentReview ? 'green' : 'gray'}
              dot={<ClockCircleOutlined style={{ fontSize: '16px' }} />}
            >
              <Row>
                <Col>{isCurrentReview ? <Tag color="success">Current review</Tag> : <Tag>Outdated review</Tag>}</Col>
              </Row>

              <Row>
                <SolutionReview
                  sessionGithubId={props.sessionGithubId}
                  index={index}
                  review={review}
                  maxScore={props.maxScore}
                  areMessagesVisible={isCurrentReview}
                >
                  <Row>
                    <Col>
                      <Button
                        size="middle"
                        type={isCurrentReview ? 'primary' : 'default'}
                        htmlType="button"
                        icon={isCurrentReview ? <EditFilled /> : <EditOutlined />}
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
