import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { MessageFilled, SendOutlined } from '@ant-design/icons';
import { Button, Col,  Form, Input, InputRef, Row, Typography } from 'antd';
import { Comment } from '@ant-design/compatible';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CrossCheckMessageAuthor, CrossCheckMessageAuthorRole } from 'services/course';
import { UserAvatar } from '../UserAvatar';

const { Text } = Typography;

export type MessageSendingPanelProps = {
  sessionId: number;
  sessionGithubId: string;
  author: CrossCheckMessageAuthor | null;
  currentRole: CrossCheckMessageAuthorRole;
  areContactsVisible: boolean;
};

function MessageSendingPanel(props: MessageSendingPanelProps) {
  const { sessionId, sessionGithubId, author, currentRole, areContactsVisible } = props;

  const form = Form.useFormInstance();
  const inputValue = Form.useWatch('content', form);
  const inputRef = useRef<InputRef>(null);
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(false);

  useEffect(() => {
    if (isPanelOpen) {
      inputRef.current?.focus({
        cursor: 'end',
      });
    }
  }, [isPanelOpen]);

  const handleEnterButton = (event: KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    setIsPanelOpen(true);
  };

  const changePanelOpenness = () => {
    setIsPanelOpen(previous => !previous);
  };

  const changePreviewVisibility = () => {
    setIsPreviewVisible(previous => !previous);
  };

  return (
    <Comment
      avatar={
        <UserAvatar
          author={
            currentRole === CrossCheckMessageAuthorRole.Reviewer
              ? author && { id: sessionId, githubId: sessionGithubId }
              : { id: sessionId, githubId: sessionGithubId }
          }
          role={currentRole}
          areContactsVisible={areContactsVisible}
          size={24}
        />
      }
      content={
        <>
          {!isPanelOpen && (
            <Row>
              <Col span={24}>
                <Input
                  type="text"
                  maxLength={0}
                  placeholder="Leave a message"
                  suffix={<SendOutlined />}
                  onClick={changePanelOpenness}
                  onPressEnter={handleEnterButton}
                  style={{ maxWidth: 512 }}
                />
              </Col>
            </Row>
          )}

          {isPanelOpen && (
            <>
              <Row>
                {isPreviewVisible && (
                  <Col span={24}>
                    <Text>
                      <ReactMarkdown rehypePlugins={[remarkGfm]}>
                        {inputValue === '' ? 'Nothing to preview' : inputValue}
                      </ReactMarkdown>
                    </Text>
                  </Col>
                )}

                <Col span={24} hidden={isPreviewVisible}>
                  <Form.Item name="content" rules={[{ required: true, message: 'Please enter message' }]}>
                    <Input.TextArea
                      ref={inputRef}
                      rows={3}
                      showCount
                      maxLength={512}
                      placeholder="Leave a message"
                      style={{ maxWidth: 512 }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row style={{ marginBottom: 4 }}>
                <Col>
                  <Text type="secondary">notification of messages: off</Text>
                </Col>
              </Row>

              <Row gutter={[8, 8]}>
                <Col>
                  <Button type="primary" htmlType="submit" icon={<MessageFilled />}>
                    Send message
                  </Button>
                </Col>

                <Col>
                  <Button type="default" danger onClick={changePanelOpenness}>
                    Cancel
                  </Button>
                </Col>

                <Col>
                  <Button type="default" onClick={changePreviewVisibility}>
                    {isPreviewVisible ? 'Write' : 'Preview'}
                  </Button>
                </Col>
              </Row>
            </>
          )}
        </>
      }
    />
  );
}

export default MessageSendingPanel;
