import * as React from 'react';
import { Input, Form } from 'antd';

export function CommentInput(props: { [key: string]: any; notRequired?: boolean }) {
  const { notRequired, ...otherProps } = props;
  return (
    <Form.Item
      {...otherProps}
      name="comment"
      label="Comment"
      rules={notRequired ? [] : [{ required: true, message: 'Please leave a detailed comment', min: 30 }]}
    >
      <Input.TextArea rows={5} />
    </Form.Item>
  );
}
