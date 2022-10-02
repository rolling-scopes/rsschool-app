import { Button, Col, Form, message, Result, Row, Select, Typography } from 'antd';
import { FormInstance } from 'antd/lib/form';
import Image from 'next/image';
import { CourseDto as Course } from 'api';
import { PageLayout, PageLayoutSimple } from 'components/PageLayout';
import { StudentSearch } from 'components/StudentSearch';
import withSession, { Session } from 'components/withSession';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService } from 'services/course';
import { CoursesService } from 'services/courses';
import { MentorRegistryService, MentorResponse } from 'services/mentorRegistry';
import { Warning } from 'components/Warning';

const { Link } = Typography;

const mentorRegistry = new MentorRegistryService();
function Page(props: { session: Session; courseAlias?: string }) {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [noAccess, setNoAccess] = useState<boolean | null>(null);
  const [isPreferredCourse, setIsPreferredCourse] = useState<boolean | null>(null);
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
      const courseAlias = (router.query?.course as string).toLowerCase();
      if (courseAlias == null) {
        setIsPreferredCourse(false);
        return;
      }
      const courses = await new CoursesService().getCourses();
      const course = courses.find(c => c.alias.toLowerCase() === courseAlias) ?? null;
      setCourse(course);
      const mentor = await mentorRegistry.getMentor();
      const preferredCourse = course?.id ? mentor.preferredCourses?.includes(course?.id) : null;
      const preselectedCourses = course?.id ? mentor.preselectedCourses?.includes(course?.id) : null;
      setIsPreferredCourse(preferredCourse);
      if (preselectedCourses === false) {
        setNoAccess(true);
        return;
      } else {
        setNoAccess(false);
        setMentorData(mentor);
        form.setFieldsValue(mentor);
      }
    } catch {
      setNoAccess(null);
    } finally {
      setLoading(false);
    }
  }, [router.query.course]);

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
      message.error('An error occurred. Please try later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading || (noAccess === null && isPreferredCourse === null)) {
    return null;
  }

  if (course == null) {
    return (
      <Warning
        loading={false}
        githubId={props.session.githubId}
        imagePath="/svg/err.svg"
        nameImage="Course Not Found"
        textMessage="Sorry, Course Not Found"
      />
    );
  }

  const pageProps = {
    loading,
    title: 'Confirm Mentorship',
    githubId: props.session.githubId,
    courseName: course.name,
  };

  if (noAccess && !isPreferredCourse) {
    const message = (
      <div>
        <Link href={`/registry/mentor?course=${router.query?.course}`}>
          <a>Register as a mentor for the course</a>
        </Link>
      </div>
    );
    return (
      <Warning
        loading={false}
        githubId={props.session.githubId}
        imagePath="/svg/wanted-mentors.svg"
        nameImage="Not registered"
        textMessage={message}
      />
    );
  }

  if (noAccess && isPreferredCourse) {
    return (
      <PageLayout loading={false} githubId={props.session.githubId}>
        <Row justify="center" style={{ margin: '65px 0 25px 0' }}>
          <Image src="/static/images/rs-hero.png" alt="You are RS hero" width={175} height={175} />
        </Row>
        <Row justify="center">
          <h1 style={{ fontSize: '32px', marginBottom: 15, maxWidth: 600, textAlign: 'center' }}>
            Thank you for registration as a mentor for Rolling Scopes School
          </h1>
        </Row>
        <Row justify="center">
          <h2 style={{ marginBottom: 15, maxWidth: 600, textAlign: 'center', fontWeight: 100 }}>
            <p>
              Hello, our future mentor, we are very happy to see your in The Rolling Scopes School. But before you start
              your journey we need to consider your application and submit you to a course.
            </p>
            <p style={{ marginBottom: 15 }}>
              It can take a little time. We will send you another mail with next steps late
            </p>
            <p style={{ fontWeight: 500 }}>
              We really appreciate your interest for school.
              <br />
              See you soon.
            </p>
          </h2>
        </Row>
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
          <StudentSearch onlyStudentsWithoutMentorShown={true} labelInValue courseId={course.id} mode="multiple" />
        </Form.Item>

        <Button style={{ marginTop: 32 }} size="large" type="primary" htmlType="submit">
          Confirm
        </Button>
      </Form>
    </>
  );
}

export default withSession(Page);
