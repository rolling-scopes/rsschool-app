import { useEffect } from 'react';
import { Input, Form, Button, Typography } from 'antd';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Props = {
  historicalCommentSelected: string;
};

export default function MarkdownInput({ historicalCommentSelected }: Props) {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [text, setText] = useState('');
  const [comment, setComment] = useState<string | null>(null);

  useEffect(() => {
    if (historicalCommentSelected !== '') {
      setText(historicalCommentSelected);
    }
  }, [historicalCommentSelected]);

  const toggleView = () => {
    setPreviewVisible(!previewVisible);
    renderComment();
  };

  const resetText = () => {
    setPreviewVisible(false);
    setText('');
  };

  const renderComment = () => {
    if (!text) {
      setComment('Please leave a comment');
    } else if (text.length < 30) {
      setComment('Please leave a detailed comment');
    } else {
      setComment(null);
    }
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
          <Input.TextArea onChange={({ currentTarget: { value } }) => setText(value)} rows={5} />
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
          <Typography.Paragraph type="danger">{comment}</Typography.Paragraph>
          <Button onClick={toggleView}>Write</Button> {link}
        </div>
      ) : (
        ''
      )}
    </div>
  );
}
