import { Alert, Button, Form, Input, Select } from 'antd';
import { BadgeDto, BadgeEnum, GratitudesApi } from 'api';
import { AxiosError } from 'axios';
import { PageLayoutSimple } from 'components/PageLayout';
import { UserSearch } from 'components/UserSearch';
import { useMessage } from 'hooks';
import { SessionProvider, useActiveCourseContext } from 'modules/Course/contexts';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAsync } from 'react-use';
import { type UserBasic, UserService } from 'services/user';

interface IGratitude {
  userIds: number[];
  courseId: number;
  badgeId: BadgeEnum;
  comment: string;
}

const gratitudesApi = new GratitudesApi();
const userService = new UserService();

function GratitudePage() {
  const { message } = useMessage();
  const { course, courses } = useActiveCourseContext();
  const [badges, setBadges] = useState<BadgeDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [preselectedUser, setPreselectedUser] = useState<UserBasic | null>(null);
  const [form] = Form.useForm();
  const router = useRouter();
  const githubId = router.query.githubId;

  useAsync(async () => {
    const { data: badges } = await gratitudesApi.getBadges(course.id);
    setBadges(badges);
  }, []);

  useEffect(() => {
    if (githubId && typeof githubId === 'string') {
      loadUserByGithubId(githubId);
    }
  }, [githubId]);

  const loadUserByGithubId = async (githubId: string) => {
    try {
      setLoadingUser(true);
      const users = await userService.searchUser(githubId);
      const user = users.find(u => u.githubId === githubId);
      if (user) {
        setPreselectedUser(user);
        form.setFieldsValue({ userIds: [user.id] });
      }
    } catch (error) {
      console.error('Failed to load user by githubId:', error);
    } finally {
      setLoadingUser(false);
    }
  };

  const loadUsers = async (searchText: string) => {
    return userService.searchUser(searchText);
  };

  const handleSubmit = async (values: IGratitude) => {
    try {
      setLoading(true);
      await gratitudesApi.createGratitude(values);
      form.resetFields();
      message.success('Your feedback has been submitted.');
    } catch (e) {
      const error = e as AxiosError<{ message: string }>;
      const response = error.response;
      const errorMessage = response?.data?.message ?? 'An error occurred. Please try later.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onCourseChange = async (value: number) => {
    const { data } = await gratitudesApi.getBadges(value);
    setBadges(data);
  };

  const shouldWaitForUser = githubId && typeof githubId === 'string';
  const showForm = !shouldWaitForUser || (shouldWaitForUser && !loadingUser);

  return (
    <PageLayoutSimple loading={loading || loadingUser} title="#gratitude">
      <Alert message="Your feedback will be posted to #gratitude channel in Discord" style={{ marginBottom: 16 }} />

      {showForm && (
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            name="userIds"
            label="Person"
            rules={[
              {
                required: true,
                message: 'Please select a person',
              },
              {
                type: 'array',
                max: 5,
                message: 'Please select no more than 5 people',
              },
            ]}
          >
            <UserSearch
              mode="multiple"
              searchFn={loadUsers}
              defaultValues={preselectedUser ? [preselectedUser] : undefined}
            />
          </Form.Item>
          <Form.Item
            name="courseId"
            label="Course"
            initialValue={course.id}
            rules={[{ required: true, message: 'Please select a course' }]}
          >
            <Select placeholder="Select a course" onChange={onCourseChange}>
              {courses.map(course => (
                <Select.Option key={course.id} value={course.id}>
                  {course.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            initialValue={BadgeEnum.ThankYou}
            name="badgeId"
            label="Badge"
            rules={[
              {
                required: true,
              },
            ]}
          >
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
              {
                validator: (_, value) => {
                  if (value.includes('@')) {
                    return Promise.reject();
                  }
                  return Promise.resolve();
                },
                message: 'The comment can\'t include "@" symbol',
              },
            ]}
          >
            <Input.TextArea rows={8} />
          </Form.Item>
          <Button size="large" type="primary" htmlType="submit">
            Submit
          </Button>
        </Form>
      )}
    </PageLayoutSimple>
  );
}

function Page() {
  return (
    <SessionProvider>
      <GratitudePage />
    </SessionProvider>
  );
}

export default Page;
