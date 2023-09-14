import { useState } from 'react';
import { useAsync } from 'react-use';
import { Alert, Button, Form, Input, message, Select } from 'antd';
import { BadgeDto, BadgeDtoIdEnum, GratitudesApi } from 'api';
import { PageLayoutSimple } from 'components/PageLayout';
import { UserSearch } from 'components/UserSearch';
import { UserService } from 'services/user';
import { AxiosError } from 'axios';
import { ActiveCourseProvider, SessionProvider, useActiveCourseContext } from 'modules/Course/contexts';

interface IGratitude {
  userIds: number[];
  courseId: number;
  badgeId: BadgeDtoIdEnum;
  comment: string;
}

const gratitudesApi = new GratitudesApi();
const userService = new UserService();

function GratitudePage() {
  const { course, courses } = useActiveCourseContext();
  const [badges, setBadges] = useState<BadgeDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useAsync(async () => {
    const { data: badges } = await gratitudesApi.getBadges(course.id);
    setBadges(badges);
  }, []);

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
      const error = e as AxiosError<any>;
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

  return (
    <PageLayoutSimple loading={loading} title="#gratitude">
      <Alert message="Your feedback will be posted to #gratitude channel in Discord" style={{ marginBottom: 16 }} />

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
          <UserSearch mode="multiple" searchFn={loadUsers} />
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
          initialValue={BadgeDtoIdEnum.ThankYou}
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

function Page() {
  return (
    <SessionProvider>
      <ActiveCourseProvider>
        <GratitudePage />
      </ActiveCourseProvider>
    </SessionProvider>
  );
}

export default Page;
