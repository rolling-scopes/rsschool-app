import * as React from 'react';
import { Input, Form } from 'antd';

export function GithubPrInput(props: any) {
  return (
    <Form.Item
      {...props}
      name="githubPrUrl"
      label="Github Pull Request URL"
      rules={[
        {
          message: 'Please enter a valid Github Pull Request URL',
          pattern: /https:\/\/github.com\/(\w|\d|\-)+\/(\w|\d|\-)+\/pull\/(\d)+/gi,
        },
      ]}
    >
      <Input />
    </Form.Item>
  );
}
