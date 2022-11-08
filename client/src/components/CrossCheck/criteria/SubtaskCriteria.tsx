import React from 'react';
import { Rate, Typography } from 'antd';
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
    <div style={{ border: '1px solid #F5F5F5', margin: '24px 0' }} key={task.key}>
      <Typography.Text
        style={{
          display: 'block',
          margin: '0',
          fontSize: '14px',
          background: '#FAFAFA',
          borderBottom: '1px solid #F5F5F5',
          padding: '14px 12px',
        }}
      >
        {task.text}
      </Typography.Text>
      <div style={{ display: 'flex', padding: '13px 12px', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography.Text style={{ fontSize: '14px' }}>Quality of execution:</Typography.Text>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
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
          <Typography.Text style={{ fontSize: '14px' }}>
            {countStar.filter(item => item.key === task.key).length === 0
              ? 0
              : countStar.filter(item => item.key === task.key)[0].point}{' '}
            / {task.max}
          </Typography.Text>
        </div>
      </div>
      <TextArea
        value={criteriaComment.find(item => item.key === task.key)?.textComment}
        placeholder="Comment about this criteria for task"
        rows={2}
        style={{ width: 'calc(100% - 24px)', display: 'block', margin: '0 auto 16px' }}
        onInput={event => updateComment((event.target as HTMLInputElement).value, task.key)}
      />
    </div>
  );
}
