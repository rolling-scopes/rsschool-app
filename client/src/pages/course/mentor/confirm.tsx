import { Button, Col, Form, message, Result, Row, Typography } from 'antd';
import { CourseDto as Course } from 'api';
import { PageLayout, PageLayoutSimple } from 'components/PageLayout';
import withSession, { Session } from 'components/withSession';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService } from 'services/course';
import { CoursesService } from 'services/courses';
import { MentorRegistryService, MentorResponse } from 'services/mentorRegistry';
import { Warning } from 'components/Warning';
import { MentorOptions } from 'components/MentorOptions';
import { SessionProvider } from 'modules/Course/contexts';
import { CoursePageProps } from 'services/models';

const { Link } = Typography;

const mentorRegistry = new MentorRegistryService();

function MentorConfirmPage(props: { session: Session; courseAlias?: string }) {
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
        githubId={props.session.githubId}
        imagePath="/svg/err.svg"
        imageName="Course Not Found"
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
          <a>Register as a Mentor for the Course</a>
        </Link>
      </div>
    );
    return (
      <Warning
        githubId={props.session.githubId}
        imagePath="/svg/wanted-mentors.svg"
        imageName="Not registered"
        textMessage={message}
      />
    );
  }

  if (noAccess && isPreferredCourse) {
    const message = (
      <div>
        <Row justify="center">
          <h1 style={{ fontSize: '32px', marginBottom: 15, maxWidth: 600, textAlign: 'center' }}>
            Thank you for registration as a mentor for Rolling Scopes School
          </h1>
        </Row>
        <Row justify="center">
          <h2 style={{ fontSize: '19px', marginBottom: 15, maxWidth: 600, textAlign: 'center', fontWeight: 100 }}>
            <p>
              Hello, our future mentor, we are very happy to see you in The Rolling Scopes School. But before you start
              your journey we need to consider your application and submit you to a course.
            </p>
            <p style={{ marginBottom: 15 }}>
              It can take a little time. We will send you another mail with next steps later
            </p>
            <p style={{ fontWeight: 500 }}>
              We really appreciate your interest for school.
              <br />
              See you soon.
            </p>
          </h2>
        </Row>
      </div>
    );
    return (
      <Warning
        githubId={props.session.githubId}
        imagePath="/images/rs-hero.png"
        imageName="You are RS hero"
        textMessage={message}
      />
    );
  }

  if (success) {
    return (
      <PageLayout {...pageProps}>
        <SuccessComponent />
      </PageLayout>
    );
  }

  return (
    <PageLayoutSimple {...pageProps}>
      <Typography.Paragraph>
        We kindly ask you confirm your desire to be mentor in {course.name} course. Just in case, you can change your
        preference below and select student which you want to mentor
      </Typography.Paragraph>
      <MentorOptions form={form} mentorData={mentorData} handleSubmit={handleSubmit} course={course} />
    </PageLayoutSimple>
  );
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

function Page(props: CoursePageProps) {
  return (
    <SessionProvider>
      <MentorConfirmPage {...props} />
    </SessionProvider>
  );
}

export default withSession(Page);
