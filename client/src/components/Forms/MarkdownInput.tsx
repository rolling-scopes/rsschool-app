import * as React from 'react';
import { Input, Form, Button, Typography } from 'antd';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownInput(props: { [key: string]: any; notRequired?: boolean }) {
  const { notRequired, ...otherProps } = props;
  const [previewVisible, setPreviewVisible] = useState(false);
  const [text, setText] = useState('');

  const toogleView = () => {
    setPreviewVisible(!previewVisible);
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
          {...otherProps}
          name="comment"
          label="Comment (markdown syntax is supported)"
          rules={notRequired ? [] : [{ required: true, message: 'Please leave a detailed comment', min: 30 }]}
        >
          <Input.TextArea value={text} onChange={e => setText(e.currentTarget.value)} rows={5} />
        </Form.Item>
        <Button onClick={toogleView}>Preview</Button> {link}
      </div>
      {previewVisible ? (
        <div>
          <div>
            <Typography.Text>
              <ReactMarkdown rehypePlugins={[remarkGfm]}>{text}</ReactMarkdown>
            </Typography.Text>
          </div>
          <Button onClick={toogleView}>Write</Button> {link}
        </div>
      ) : (
        ''
      )}
    </div>
  );
}
