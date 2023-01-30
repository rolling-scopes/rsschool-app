import { Col, Row, Typography, Rate, Input, Avatar, Comment, Card } from 'antd';
import { useCallback } from 'react';
import { FrownTwoTone, MehTwoTone, SmileTwoTone } from '@ant-design/icons';
import { GithubAvatar } from 'components/GithubAvatar';

import { CrossCheckCriteria, CrossCheckComment } from 'services/course';

function RateIcon(props: { index: number; value: number }) {
  const color = props.index + 1 <= props.value ? colors[props.index] : '#aaa';
  switch (props.index) {
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

export function CriteriaForm(props: Props) {
  const { criteria, selfReview } = props;

  if (!criteria) {
    return null;
  }

  const hasSelfReview = props.selfReview != null;

  const onReviewCriteria = useCallback(
    (criteriaId: string, percentage: number) => {
      const newReview: Review[] = props.criteria
        .filter(d => d.type != 'title')
        .map(d => ({
          criteriaId: d.criteriaId,
          percentage:
            criteriaId === d.criteriaId
              ? percentage
              : props.value?.find(v => v.criteriaId === d.criteriaId)?.percentage ?? 0,
        }));
      props.onChange?.(newReview, props.reviewComments);
    },
    [props.value, props.onChange],
  );

  const onReviewCommentChange = useCallback(
    (criteriaId: string, text: string) => {
      const newComments: CrossCheckComment[] = props.criteria
        .filter(d => d.type != 'title')
        .map(d => {
          const comment = props.reviewComments?.find(
            v => v.authorId === props.authorId && v.criteriaId === d.criteriaId,
          );
          return {
            authorId: props.authorId,
            timestamp: comment?.timestamp ?? Date.now(),
            criteriaId: d.criteriaId,
            text: criteriaId === d.criteriaId ? text : comment?.text ?? '',
          };
        })
        .filter(c => c.text);
      props.onChange?.(props.value ?? [], newComments);
    },
    [props.value, props.onChange],
  );

  return (
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
        const currentReview = props.value?.find(r => r.criteriaId === item.criteriaId) ?? {
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
                      character={(props: { index: number; value: number; focused: boolean }) => (
                        <RateIcon value={props.value} index={props.index} />
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
                    {props.comments
                      ?.filter(c => c.criteriaId === item.criteriaId)
                      .map(c => (
                        <Comment
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
  );
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
