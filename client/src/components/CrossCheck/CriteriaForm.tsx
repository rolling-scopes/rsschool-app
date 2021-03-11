import { Divider, Radio, Typography } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { useCallback, Fragment } from 'react';
import { CrossCheckCriteria, CrossCheckComment } from 'services/course';

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
  comments: CrossCheckComment[];
  criteria: CrossCheckCriteria[];
  selfReview?: Review[];
  value?: Review[];
  onChange?: (review: Review[], comments: CrossCheckComment[]) => void;
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

      props.onChange?.(newReview, props.comments);
    },
    [props.value, props.onChange],
  );

  const onReviewCommentChange = useCallback(
    (criteriaId: string, text: string) => {
      const newComments: CrossCheckComment[] = props.criteria
        .filter(d => d.type != 'title')
        .map(d => {
          const comment = props.comments?.find(v => v.criteriaId === d.criteriaId);
          return {
            timestamp: comment?.timestamp ?? Date.now(),
            criteriaId: d.criteriaId,
            text: criteriaId === d.criteriaId ? text : comment?.text ?? '',
          };
        });
      props.onChange?.(props.value ?? [], newComments);
    },
    [props.value, props.onChange],
  );

  return (
    <>
      {criteria.map((item, i) => {
        if (item.type === 'title') {
          return (
            <div key={i} style={{ marginTop: 36 }}>
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
        const isFirstInGroup = criteria[i - 1]?.type === 'title';

        return (
          <Fragment key={i}>
            {!isFirstInGroup ? <Divider /> : null}
            <Typography.Paragraph key={item.criteriaId}>
              <div style={{ display: 'flex', marginBottom: 12, minHeight: 60 }}>
                <div style={{ height: 60, paddingLeft: 12, paddingRight: 12 }}>
                  <div style={{ fontSize: 24, fontWeight: 600 }}>{item.max}</div>
                  <div>Points</div>
                </div>
                <Typography.Text style={{ flex: 1 }}>{item.text}</Typography.Text>
              </div>

              {hasSelfReview && (
                <div style={{ marginTop: 8 }}>
                  <Typography.Text strong>Self Review:</Typography.Text>
                  <div>
                    <Typography.Text mark>
                      {percentageToText(selfReview?.find(r => r.criteriaId === item.criteriaId)?.percentage ?? 0)}
                    </Typography.Text>
                  </div>
                </div>
              )}
              <div style={{ marginTop: 8 }}>
                <Typography.Text strong>Your Review:</Typography.Text>
                <div>
                  <Radio.Group
                    value={currentReview.percentage}
                    onChange={event => onReviewCriteria(item.criteriaId, event.target.value)}
                    defaultValue={0}
                  >
                    <Radio.Button value={0}>{ReviewValue.No}</Radio.Button>
                    <Radio.Button value={0.5}>{ReviewValue.Partial}</Radio.Button>
                    <Radio.Button value={1}>{ReviewValue.Done}</Radio.Button>
                  </Radio.Group>
                </div>
                <div style={{ marginTop: 12 }}>
                  <Typography.Text strong>Comment</Typography.Text>
                  <TextArea
                    value={props.comments.find(c => c.criteriaId === item.criteriaId)?.text}
                    onChange={event => onReviewCommentChange(item.criteriaId, event.target.value)}
                  />
                </div>
              </div>
            </Typography.Paragraph>
          </Fragment>
        );
      })}
    </>
  );
}

function percentageToText(percentage: number): ReviewValue {
  if (percentage > 0.5) {
    return ReviewValue.Done;
  }
  if (percentage > 0) {
    return ReviewValue.Partial;
  }
  return ReviewValue.No;
}
