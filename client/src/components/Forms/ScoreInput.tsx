import * as React from 'react';
import { InputNumber, Form } from 'antd';

type Props = { maxScore?: number };

export function ScoreInput({ maxScore }: Props) {
  const maxScoreLabel = maxScore ? ` (Max ${maxScore} points)` : '';
  return (
    <Form.Item name="score" label={`Score${maxScoreLabel}`} rules={[{ required: true, message: 'Please enter score' }]}>
      <InputNumber step={1} min={0} max={maxScore} />
    </Form.Item>
  );
}
