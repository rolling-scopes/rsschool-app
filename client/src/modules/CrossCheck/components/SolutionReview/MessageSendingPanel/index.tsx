import { MessageFilled } from '@ant-design/icons';
import { Button, Col, Comment, Form, Input, Row } from 'antd';
import { CrossCheckMessageAuthor, CrossCheckMessageAuthorRole } from 'services/course';
import { UserAvatar } from '../UserAvatar';

type Props = {
  sessionId: number;
  sessionGithubId: string;
  author: CrossCheckMessageAuthor | null;
  currentRole: CrossCheckMessageAuthorRole;
  areContactsVisible: boolean;
};

export function MessageSendingPanel(props: Props) {
  const { author, sessionId, sessionGithubId, currentRole, areContactsVisible } = props;

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
          <Row>
            <Col span={24}>
              <Form.Item name="content" rules={[{ required: true, message: 'Please enter message' }]}>
                <Input.TextArea rows={3} showCount maxLength={512} style={{ maxWidth: 512 }} />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col>
              <Button htmlType="submit" icon={<MessageFilled />} type="primary">
                Send message
              </Button>
            </Col>
          </Row>
        </>
      }
    />
  );
}
