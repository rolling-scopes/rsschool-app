import { Alert, Button, Form, Input, message, Select } from 'antd';
import { PageLayoutSimple } from 'components';
import { UserSearch } from 'components/UserSearch';
import withSession, { Session } from 'components/withSession';
import { useState } from 'react';
import { GratitudeService } from 'services/gratitude';
import { UserService } from 'services/user';

type Props = {
  session: Session;
};

type Badge = { id: string; name: string };

const heroBadges = [
  { id: 'Congratulations', name: 'Congratulations' },
  { id: 'Expert_help', name: 'Expert help' },
  { id: 'Great_speaker', name: 'Great speaker' },
  { id: 'Good_job', name: 'Good job' },
  { id: 'Helping_hand', name: 'Helping hand' },
  { id: 'Hero', name: 'Hero' },
  { id: 'Thank_you', name: 'Thank you' },
];

function Page(props: Props) {
  const [badges] = useState(heroBadges as Badge[]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const userService = new UserService();
  const gratitudeService = new GratitudeService();

  const loadUsers = async (searchText: string) => {
    return userService.searchUser(searchText);
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      await gratitudeService.postGratitude({
        toUserId: values.userId,
        comment: values.comment,
        badgeId: values.badgeId,
      });
      form.resetFields();
      message.success('Your feedback has been submitted.');
    } catch (e) {
      message.error('An error occurred. Please try later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayoutSimple loading={loading} title="#gratitude" githubId={props.session.githubId}>
      <Alert message="Your feedback will be posted to #gratitude channel in Discord" style={{ marginBottom: 16 }} />

      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Form.Item name="userId" label="Person" rules={[{ required: true, message: 'Please select a person' }]}>
          <UserSearch searchFn={loadUsers} />
        </Form.Item>
        <Form.Item name="badgeId" label="Badge">
          <Select placeholder="Select a badge">
            {badges.map(badge => (
              <Select.Option key={badge.id} value={badge.id}>
                {badge.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="comment"
          label="Comment"
          rules={[
            {
              required: true,
              min: 20,
              whitespace: true,
              message: 'The comment must contain at least 20 characters',
            },
          ]}
        >
          <Input.TextArea rows={8} />
        </Form.Item>
        <Button size="large" type="primary" htmlType="submit">
          Submit
        </Button>
      </Form>
    </PageLayoutSimple>
  );
}

export default withSession(Page);
