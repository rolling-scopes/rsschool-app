import { Button, Form, Input, message } from 'antd';
import { PageLayoutSimple, UserSearch } from 'components';
import withSession, { Session } from 'components/withSession';
import { NextRouter, withRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import { UserService } from 'services/user';
import { useLocalStorage } from 'react-use';

type Props = { router: NextRouter; session: Session };
type User = { githubId: string; id: number; name: string };

function Page(props: Props) {
  const { router } = props;
  const githubId = (router.query?.githubId as string) ?? null;
  const userId = (router.query?.userId as string) ?? null;

  const userService = useMemo(() => new UserService(), []);
  const [user] = useState<User | null>(githubId && userId ? { name: '', githubId, id: Number(userId) } : null);
  const [loading, setLoading] = useState(false);
  const [activeCourseId] = useLocalStorage<string>('activeCourseId');
  const [form] = Form.useForm();

  const loadUsers = async (searchText: string) => userService.searchUser(searchText);

  const handleSubmit = useCallback(async (values: { userId: number; comment: string }) => {
    if (!activeCourseId) return;
    try {
      setLoading(true);
      const data = { toUserId: values.userId, comment: values.comment };
      await userService.submitStudentFeedback(data, activeCourseId);
      form.resetFields();
      message.success('Your feedback has been submitted.');
    } catch (e) {
      message.error('An error occurred. Please try later.');
    } finally {
      setLoading(false);
    }
  }, []);

  const userSearchProps = user ? { defaultValues: [user] } : { searchFn: loadUsers };

  return (
    <PageLayoutSimple loading={loading} githubId={props.session.githubId} title="Student's Feedback">
      <Form form={form} layout="vertical" initialValues={getInitialValues(user)} onFinish={handleSubmit}>
        <Form.Item name="userId" label="Person" rules={[{ required: true, message: 'Please select a person' }]}>
          <UserSearch {...userSearchProps} />
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
    userId: user?.id,
  };
}

export default withRouter(withSession(Page));
