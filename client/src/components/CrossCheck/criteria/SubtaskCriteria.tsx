import React from 'react';
import { Rate, Typography } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { Input } from 'antd';

import { CrossCheckCriteriaData, ICommentState, ICountState } from '../CrossCheckCriteriaForm';

interface SubtaskCriteriaProps {
  criteriaComment: ICommentState[];
  task: CrossCheckCriteriaData;
  countStar: ICountState[];
  updateCountStar: (event: number, max: number, key: string) => void;
  updateComment: (value: string, key: string) => void;
}

export default function SubtaskCriteria({
  criteriaComment,
  task,
  countStar,
  updateCountStar,
  updateComment,
}: SubtaskCriteriaProps) {
  const { TextArea } = Input;

  const criteriaScore = task ? (countStar.find(item => item.key === task.key)?.point as number) : 0;

  return (
    <React.Fragment key={task.key}>
      <Typography.Text style={{ display: 'block', margin: '30px 0 20px 0', fontSize: '14px' }}>
        <CheckOutlined style={{ margin: '0 5px 0 0' }} />
        {task.text}
      </Typography.Text>
      <Typography.Text style={{ fontSize: '14px' }}>Comment:</Typography.Text>
      <TextArea
        value={criteriaComment.find(item => item.key === task.key)?.textComment}
        rows={3}
        style={{ width: '500px', display: 'block' }}
        onInput={event => updateComment((event.target as HTMLInputElement).value, task.key)}
      />
      <Rate
        value={(criteriaScore / (task.max as number)) * 5}
        allowClear={false}
        allowHalf
        defaultValue={0}
        count={5}
        onChange={event => {
          updateCountStar(event, task.max as number, task.key);
        }}
      />
      <Typography.Text
        style={{
          margin: '0 0 0 20px',
          fontSize: '14px',
        }}
      >
        {countStar.filter(item => item.key === task.key).length === 0
          ? 0
          : countStar.filter(item => item.key === task.key)[0].point}{' '}
        / {task.max}
      </Typography.Text>
    </React.Fragment>
  );
}
