import { Card, Col, Form, Rate, Row } from 'antd';
import { ReactNode } from 'react';

type Props = {
  content: ReactNode;
  fieldName: string[];
  required?: boolean;
  tooltips?: string[];
};

/**
 * Question requiring a rate answer
 */
export function QuestionCard({ content, fieldName, required, tooltips }: Props) {
  return (
    <Card bodyStyle={{ padding: '12px 24px' }} style={{ flex: 1 }}>
      <Row align="middle" wrap={false}>
        <Col flex={1} style={{ flexWrap: 'wrap' }}>
          {content}
        </Col>
        <Col style={{ flexShrink: 0, marginLeft: '10px' }}>
          <Form.Item name={fieldName} rules={[{ required, message: 'Required' }]}>
            <Rate tooltips={tooltips} />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
}
