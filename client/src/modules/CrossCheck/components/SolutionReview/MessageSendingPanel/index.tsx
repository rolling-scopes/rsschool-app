import { MessageFilled } from '@ant-design/icons';
import { Button, Col, Comment, Form, Input, Row } from 'antd';
import { Discord } from 'api';
import { TaskSolutionResultRole } from 'services/course';
import { UserAvatar } from '../UserAvatar';

type Props = {
  sessionGithubId: string;
  author: {
    name: string;
    githubId: string;
    discord: Discord | null;
  } | null;
  currentRole: TaskSolutionResultRole;
  areContactsVisible: boolean;
};

export function MessageSendingPanel(props: Props) {
  const { author, sessionGithubId, currentRole, areContactsVisible } = props;

  return (
    <Comment
      avatar={
        <UserAvatar
          author={
            currentRole === TaskSolutionResultRole.Reviewer
              ? author && { githubId: sessionGithubId, discord: null }
              : { githubId: sessionGithubId, discord: null }
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
