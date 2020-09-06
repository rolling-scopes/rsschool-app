import { Button, Form, Select, message, Typography, Row, Col, Result } from 'antd';
import { PageLayoutSimple, StudentSearch, PageLayout } from 'components';
import withSession, { Session } from 'components/withSession';
import { useState, useMemo } from 'react';
import { useAsync } from 'react-use';
import { MentorRegistryService, MentorResponse } from 'services/mentorRegistry';
import { useRouter } from 'next/router';
import { Course } from '../../../../../common/models';
import { CoursesService } from 'services/courses';
import { CourseService } from 'services/course';
import { FormInstance } from 'antd/lib/form';

const mentorRegistry = new MentorRegistryService();
function Page(props: { session: Session }) {
  const router = useRouter();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [noAccess, setNoAccess] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mentorData, setMentorData] = useState<MentorResponse | null>(null);
  const [course, setCourse] = useState(null as Course | null);

  const courseService = useMemo(() => {
    if (!course) {
      return null;
    }
    return new CourseService(course.id);
  }, [course]);

  useAsync(async () => {
    try {
      setLoading(true);
      const courseAlias = router.query['course'];
      const courses = await new CoursesService().getCourses();
      const course = courses.find(c => c.alias === courseAlias) ?? null;
      setCourse(course);
      const mentor = await mentorRegistry.getMentor();

      if (!mentor.preselectedCourses?.includes(course?.id ?? 0)) {
        setNoAccess(true);
        return;
      }

      setMentorData(mentor);
      form.setFieldsValue(mentor);
    } catch {
      setNoAccess(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (values: any) => {
    if (loading) {
      return;
    }
    try {
      setLoading(true);

      await courseService?.createMentor(props.session.githubId, {
        maxStudentsLimit: values.maxStudentsLimit,
        preferedStudentsLocation: values.preferedStudentsLocation,
        students: values.students?.map((s: any) => Number(s.value)) ?? [],
      });
      setSuccess(true);
    } catch (e) {
      message.error('An error occured. Please try later.');
    } finally {
      setLoading(false);
    }
  };

  if (course == null || (mentorData == null && loading)) {
    return null;
  }

  const pageProps = {
    loading,
    title: 'Confirm Mentorship',
    githubId: props.session.githubId,
    courseName: course.name,
  };

  if (noAccess) {
    return (
      <PageLayout {...pageProps}>
        <Result status={'403' as any} title="You are not preselected to the course" />
      </PageLayout>
    );
  }

  if (success) {
    return (
      <PageLayout {...pageProps}>
        <SuccessComponent />
      </PageLayout>
    );
  }

  return <PageLayoutSimple {...pageProps}>{renderForm(form, mentorData, handleSubmit, course)}</PageLayoutSimple>;
}

const SuccessComponent = () => {
  const titleCmp = (
    <Row gutter={24} justify="center">
      <Col xs={18} sm={16} md={12}>
        <p>Thanks for the confirmation!</p>
        <p>You are mentor now!</p>
        <Typography.Paragraph type="secondary">
          Join our <a href="https://t.me/joinchat/HqpGRxNRANkGN2xx9bL8zQ">RSSchool Mentors FAQ</a> Telegram group.
        </Typography.Paragraph>
        <p>
          <Button type="primary" size="large" href="/">
            Go to Home Page
          </Button>
        </p>
      </Col>
    </Row>
  );
  return <Result status="success" title={titleCmp} />;
};

export default withSession(Page);

function renderForm(form: FormInstance, mentorData: any, handleSubmit: (values: any) => Promise<void>, course: Course) {
  return (
    <>
      <Typography.Paragraph>
        We kindly ask you confirm your desire to be mentor in {course.name} course. Just in case, you can change your
        preference below and select student which you want to mentor
      </Typography.Paragraph>
      <Typography.Paragraph>
        Мы просим вас подтвердить свое желание быть ментором в {course.name} курсе. На всякий случай, вы можете изменить
        наши настройки ниже и указать студентов, которых вы хотели бы менторить.
      </Typography.Paragraph>
      <Form initialValues={mentorData} style={{ marginTop: 32 }} form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item
          name="maxStudentsLimit"
          label="How many students are you ready to mentor per course?"
          rules={[{ required: true, message: 'Please select students count' }]}
        >
          <Select style={{ width: 200 }} placeholder="Students count...">
            <Select.Option value={2}>2</Select.Option>
            <Select.Option value={3}>3</Select.Option>
            <Select.Option value={4}>4</Select.Option>
            <Select.Option value={5}>5</Select.Option>
            <Select.Option value={6}>6</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="preferedStudentsLocation"
          label="Preferred students location"
          help="We will use this information to distribute students"
          rules={[{ required: true, message: 'Please select a prefered location option' }]}
        >
          <Select placeholder="Select a prefered option...">
            <Select.Option value={'any'}>Any city or country</Select.Option>
            <Select.Option value={'country'}>My country only</Select.Option>
            <Select.Option value={'city'}>My city only</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          help="If you want to be a mentor of particular students"
          name="students"
          label="Predefined students (if any)"
        >
          <StudentSearch labelInValue courseId={course.id} mode="multiple" />
        </Form.Item>

        <Button style={{ marginTop: 32 }} size="large" type="primary" htmlType="submit">
          Confirm
        </Button>
      </Form>
    </>
  );
}
