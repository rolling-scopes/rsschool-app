import { useState } from 'react';
import { useAsync } from 'react-use';
import { Alert, Button, Form, Input, message, Select } from 'antd';
import { BadgeDto, BadgeDtoIdEnum, GratitudesApi } from 'api';
import { PageLayoutSimple } from 'components/PageLayout';
import { UserSearch } from 'components/UserSearch';
import withSession, { Session } from 'components/withSession';
import { CoursesService } from 'services/courses';
import { Course } from 'services/models';
import { UserService } from 'services/user';

type Props = {
  session: Session;
};

interface IGratitude {
  [name: string]: string | number | number[];
}

const gratitudesApi = new GratitudesApi();
const userService = new UserService();
const coursesService = new CoursesService();

function Page(props: Props) {
  const [badges, setBadges] = useState<BadgeDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [courses, setCourses] = useState([] as Course[]);

  useAsync(async () => {
    const courses = await coursesService.getCourses();
    const savedCourseId = Number(localStorage.getItem('activeCourseId'));
    const courseId = savedCourseId ? savedCourseId : courses[0].id;
    const { data: badges } = await gratitudesApi.getBadges(courseId);
    setCourses(courses);
    setBadges(badges);
  }, []);

  const loadUsers = async (searchText: string) => {
    return userService.searchUser(searchText);
  };

  const handleSubmit = async (values: IGratitude) => {
    try {
      setLoading(true);
      await Promise.all(
        (values.userId as number[]).map((id: number) =>
          gratitudesApi.createGratitude({
            userId: id,
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

  const onCourseChange = async (value: number) => {
    const { data } = await gratitudesApi.getBadges(value);
    setBadges(data);
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

export default withSession(Page);
