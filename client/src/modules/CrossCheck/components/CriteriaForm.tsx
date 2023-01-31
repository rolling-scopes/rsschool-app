import { Col, Row, Typography, Rate, Input, Avatar, Card } from 'antd';
import { Comment } from '@ant-design/compatible';
import { useCallback } from 'react';
import { FrownTwoTone, MehTwoTone, SmileTwoTone } from '@ant-design/icons';
import { GithubAvatar } from 'components/GithubAvatar';

import { CrossCheckCriteria, CrossCheckComment } from 'services/course';

function RateIcon({ index, value }: { index: number; value: number }) {
  const color = index + 1 <= value ? colors[index] : '#aaa';
  switch (index) {
    case 0:
      return <FrownTwoTone style={{ fontSize: 20 }} twoToneColor={color} />;
    case 1:
      return <MehTwoTone style={{ fontSize: 20 }} twoToneColor={color} />;
    default:
      return <SmileTwoTone style={{ fontSize: 20 }} twoToneColor={color} />;
  }
}

const colors = ['red', 'orange', '#52c41a'];

type Review = {
  percentage: number;
  criteriaId: string;
};

enum ReviewValue {
  No = 'No',
  Partial = 'Partial',
  Done = 'Done',
}

type Props = {
  authorId: number;
  authorGithubId?: string;
  comments: CrossCheckComment[];
  criteria: CrossCheckCriteria[];
  selfReview?: Review[];
  value?: Review[];
  onChange?: (review: Review[], comments: CrossCheckComment[]) => void;
  reviewComments: CrossCheckComment[];
};

export function CriteriaForm({ authorId, comments, reviewComments, criteria, onChange, selfReview, value }: Props) {
  const hasSelfReview = selfReview != null;

  const onReviewCriteria = useCallback(
    (criteriaId: string, percentage: number) => {
      const newReview: Review[] = criteria
        .filter(d => d.type != 'title')
        .map(d => ({
          criteriaId: d.criteriaId,
          percentage:
            criteriaId === d.criteriaId ? percentage : value?.find(v => v.criteriaId === d.criteriaId)?.percentage ?? 0,
        }));
      onChange?.(newReview, reviewComments);
    },
    [criteria, onChange, reviewComments, value],
  );

  const onReviewCommentChange = useCallback(
    (criteriaId: string, text: string) => {
      const newComments: CrossCheckComment[] = criteria
        .filter(d => d.type != 'title')
        .map(d => {
          const comment = reviewComments?.find(v => v.authorId === authorId && v.criteriaId === d.criteriaId);
          return {
            authorId: authorId,
            timestamp: comment?.timestamp ?? Date.now(),
            criteriaId: d.criteriaId,
            text: criteriaId === d.criteriaId ? text : comment?.text ?? '',
          };
        })
        .filter(c => c.text);
      onChange?.(value ?? [], newComments);
    },
    [criteria, onChange, value, reviewComments, authorId],
  );

  return criteria && criteria.length > 0 ? (
    <>
      {criteria.map((item, i) => {
        if (item.type === 'title') {
          return (
            <div key={i}>
              <Typography.Title style={{ color: '#444' }} key={item.title} level={3}>
                {item.title}
              </Typography.Title>
            </div>
          );
        }
        const currentReview = value?.find(r => r.criteriaId === item.criteriaId) ?? {
          criteriaId: item.criteriaId,
          percentage: 0,
        };
        const selfReviewPercentage = selfReview?.find(r => r.criteriaId === item.criteriaId)?.percentage ?? 0;

        return (
          <Card size="small" key={i} style={{ marginBottom: 24 }}>
            <div key={item.criteriaId}>
              <div style={{ display: 'flex', marginBottom: 12, minHeight: 60 }}>
                <div style={{ height: 60, paddingLeft: 12, paddingRight: 12 }}>
                  <div style={{ fontSize: 24, fontWeight: 600 }}>
                    <Avatar style={{ color: '#f56a00', backgroundColor: '#fde3cf' }} size={48}>
                      {item.max}
                    </Avatar>
                  </div>
                </div>
                <Typography.Text style={{ flex: 1 }}>{item.text}</Typography.Text>
              </div>
              <Row>
                <Col flex={1}>
                  <div>
                    <Typography.Text strong>Your Review</Typography.Text>
                  </div>
                  <div>
                    <Rate
                      character={props => (
                        <RateIcon key={props.index} value={props.value ?? 0} index={props.index ?? 0} />
                      )}
                      onChange={value => onReviewCriteria(item.criteriaId, convertValueToPercentage(value))}
                      value={convertPercentageToValue(currentReview.percentage)}
                      count={3}
                      tooltips={[ReviewValue.No, ReviewValue.Partial, ReviewValue.Done]}
                    />
                  </div>
                </Col>
                {hasSelfReview && (
                  <Col flex={1}>
                    <div>
                      <Typography.Text strong>Self Review</Typography.Text>
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <RateIcon
                        value={convertPercentageToValue(selfReviewPercentage)}
                        index={convertPercentageToValue(selfReviewPercentage) - 1}
                      />
                    </div>
                  </Col>
                )}
              </Row>
              <Row>
                <Col flex={1}>
                  <div style={{ marginTop: 16 }}>
                    <Typography.Title level={5}>Comments</Typography.Title>
                  </div>
                  <div>
                    {comments
                      ?.filter(c => c.criteriaId === item.criteriaId)
                      .map(c => (
                        <Comment
                          key={c.criteriaId}
                          author={c.authorGithubId}
                          avatar={<GithubAvatar githubId={c.authorGithubId} size={32} />}
                          content={<p>{c.text || '-'}</p>}
                          datetime={new Date(c.timestamp).toLocaleString()}
                        />
                      ))}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Typography.Text strong>Your comment</Typography.Text>
                    <Input.TextArea onChange={event => onReviewCommentChange(item.criteriaId, event.target.value)} />
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        );
      })}
    </>
  ) : null;
}

function convertPercentageToValue(percentage: number) {
  if (percentage === 0) {
    return 1;
  }
  if (percentage <= 0.5) {
    return 2;
  }
  return 3;
}

function convertValueToPercentage(value: number) {
  if (value === 1) {
    return 0;
  }
  if (value === 2) {
    return 0.5;
  }
  return 1;
}
