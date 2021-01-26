import { useState } from 'react';
import { useAsync } from 'react-use';
import { Alert, Button, Form, Input, message, Select } from 'antd';
import { PageLayoutSimple } from 'components';
import { UserSearch } from 'components/UserSearch';
import withSession, { Session } from 'components/withSession';
import { GratitudeService } from 'services/gratitude';
import { CoursesService } from 'services/courses';
import { Course } from 'services/models';
import { UserService } from 'services/user';

type Props = {
  session: Session;
};

interface IGratitude {
  [name: string]: string | number | number[];
}

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
  const [courses, setCourses] = useState([] as Course[]);

  const userService = new UserService();
  const gratitudeService = new GratitudeService();
  const coursesService = new CoursesService();

  const loadData = async () => {
    const courses = await coursesService.getCourses();
    setCourses(courses);
  };

  useAsync(loadData, []);

  const loadUsers = async (searchText: string) => {
    return userService.searchUser(searchText);
  };

  const handleSubmit = async (values: IGratitude) => {
    try {
      setLoading(true);
      await Promise.all(
        (values.userId as number[]).map((id: number) =>
          gratitudeService.postGratitude({
            toUserId: id,
            comment: values.comment as string,
            badgeId: values.badgeId as string,
            courseId: values.courseId as number,
          }),
        ),
      );
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
          <UserSearch mode="multiple" searchFn={loadUsers} />
        </Form.Item>
        <Form.Item
          name="courseId"
          label="Course"
          initialValue={Number(localStorage.getItem('activeCourseId'))}
          rules={[{ required: true, message: 'Please select a course' }]}
        >
          <Select placeholder="Select a course">
            {courses.map(course => (
              <Select.Option key={course.id} value={course.id}>
                {course.name}
              </Select.Option>
            ))}
          </Select>
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
