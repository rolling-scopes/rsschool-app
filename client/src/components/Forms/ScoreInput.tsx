import * as React from 'react';
import { InputNumber, Form } from 'antd';
import { CourseTask } from 'services/course';

type Props = { maxScore?: number; courseTask?: Pick<CourseTask, 'id' | 'maxScore'> };

export function ScoreInput({ maxScore, courseTask }: Props) {
  const maxScoreValue = maxScore || (courseTask ? courseTask.maxScore || 100 : undefined);
  const maxScoreLabel = maxScoreValue ? ` (Max ${maxScoreValue} points)` : '';
  return (
    <Form.Item name="score" label={`Score${maxScoreLabel}`} rules={[{ required: true, message: 'Please enter score' }]}>
      <InputNumber step={1} min={0 - (maxScoreValue ?? 0)} max={maxScoreValue} decimalSeparator={','} />
    </Form.Item>
  );
}
