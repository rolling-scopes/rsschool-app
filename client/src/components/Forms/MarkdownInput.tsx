import * as React from 'react';
import { Input, Form, Button, Typography } from 'antd';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownInput() {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [text, setText] = useState('');

  const toggleView = () => {
    setPreviewVisible(!previewVisible);
  };

  const resetText = () => {
    setPreviewVisible(false);
    setText('');
  };

  const link = (
    <span style={{ marginLeft: '20px' }}>
      <a
        target="_blank"
        href="https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax"
      >
        About markdown
      </a>
    </span>
  );

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: previewVisible ? 'none' : 'block' }}>
        <Form.Item
          name="comment"
          label="Comment (markdown syntax is supported)"
          rules={[{ required: true, message: 'Please leave a detailed comment', min: 30 }]}
          onReset={resetText}
        >
          <Input.TextArea value={text} onChange={({ currentTarget: { value } }) => setText(value)} rows={5} />
        </Form.Item>
        <Button onClick={toggleView}>Preview</Button> {link}
      </div>
      {previewVisible ? (
        <div>
          <div>
            <Typography.Text>
              <ReactMarkdown rehypePlugins={[remarkGfm]}>{text}</ReactMarkdown>
            </Typography.Text>
          </div>
          <Button onClick={toggleView}>Write</Button> {link}
        </div>
      ) : (
        ''
      )}
    </div>
  );
}
