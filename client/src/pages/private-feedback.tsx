import { Button, Form, Input, message, Alert } from 'antd';
import { PageLayoutSimple } from 'components/PageLayout';
import { UserSearch } from 'components/UserSearch';
import withSession, { Session } from 'components/withSession';
import { NextRouter, withRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { UserService } from 'services/user';

type Props = { router: NextRouter; session: Session };
type User = { githubId: string; id: number; name: string };

function Page(props: Props) {
  const { router } = props;
  const githubId = router.query ? (router.query.githubId as string) : null;
  const userId = router.query ? (router.query.userId as string) : null;

  const userService = useMemo(() => new UserService(), []);
  const [user] = useState<User | null>(githubId && userId ? { name: '', githubId, id: Number(userId) } : null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const loadUsers = async (searchText: string) => userService.searchUser(searchText);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const data = { toUserId: values.userId, comment: values.comment };
      await userService.submitPrivateFeedback(data);
      form.resetFields();
      message.success('Your feedback has been submitted.');
    } catch (e) {
      message.success('An error occured. Please try later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayoutSimple loading={loading} githubId={props.session.githubId} title="Private Feedback">
      <Alert
        style={{ marginBottom: 16 }}
        message="Your feedback will be visible to administrator and course manager only"
      />
      <Form form={form} layout="vertical" initialValues={getInitialValues(user)} onFinish={handleSubmit}>
        <Form.Item name="userId" label="Person" rules={[{ required: true, message: 'Please select a person' }]}>
          {user ? <UserSearch defaultValues={[user]} /> : <UserSearch searchFn={loadUsers} />}
        </Form.Item>
        <Form.Item
          name="comment"
          label="Comment"
          rules={[
            {
              required: true,
              min: 20,
              whitespace: true,
              message: 'Please give us more details',
            },
          ]}
        >
          <Input.TextArea rows={10} />
        </Form.Item>
        <Button size="large" type="primary" htmlType="submit">
          Submit
        </Button>
      </Form>
    </PageLayoutSimple>
  );
}

function getInitialValues(user: User | null) {
  return {
    userId: user ? user.id : undefined,
  };
}

export default withRouter(withSession(Page));
