import * as React from 'react';
import { InputNumber, Form } from 'antd';
import { CourseTaskDto } from 'api';

type Props = {
  maxScore?: number;
  courseTask?: Pick<CourseTaskDto, 'id' | 'maxScore'>;
  style?: React.CSSProperties;
};

export function ScoreInput({ maxScore, courseTask, style }: Props) {
  const maxScoreValue = maxScore || (courseTask ? courseTask.maxScore || 100 : undefined);
  const maxScoreLabel = maxScoreValue ? ` (Max ${maxScoreValue} points)` : '';
  return (
    <Form.Item name="score" label={`Score${maxScoreLabel}`} rules={[{ required: true, message: 'Please enter score' }]}>
      <InputNumber style={style} step={1} min={0 - (maxScoreValue ?? 0)} max={maxScoreValue} decimalSeparator={','} />
    </Form.Item>
  );
}
