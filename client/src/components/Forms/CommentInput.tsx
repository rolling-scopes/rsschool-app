import * as React from 'react';
import { Input, Form } from 'antd';

export function CommentInput(props: any) {
  return (
    <Form.Item
      {...props}
      name="comment"
      label="Comment"
      rules={[{ required: true, message: 'Please leave a comment' }]}
    >
      <Input.TextArea rows={5} />
    </Form.Item>
  );
}
